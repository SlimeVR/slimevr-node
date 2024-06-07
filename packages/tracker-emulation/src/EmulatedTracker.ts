import { MACAddress, Quaternion, Vector } from '@slimevr/common';
import {
  BoardType,
  DeviceBoundFeatureFlagsPacket,
  DeviceBoundHandshakePacket,
  DeviceBoundHeartbeatPacket,
  DeviceBoundPingPacket,
  DeviceBoundSensorInfoPacket,
  FirmwareFeatureFlags,
  MCUType,
  Packet,
  parse,
  RotationDataType,
  SensorStatus,
  SensorType,
  ServerBoundAccelPacket,
  ServerBoundBatteryLevelPacket,
  ServerBoundFeatureFlagsPacket,
  ServerBoundHandshakePacket,
  ServerBoundHeartbeatPacket,
  ServerBoundMagnetometerAccuracyPacket,
  ServerBoundPongPacket,
  ServerBoundRotationDataPacket,
  ServerBoundSignalStrengthPacket,
  ServerBoundTemperaturePacket,
  ServerBoundUserActionPacket,
  ServerFeatureFlags,
  UserAction
} from '@slimevr/firmware-protocol';
import { createSocket, RemoteInfo, Socket } from 'dgram';
import EventEmitter from 'events';
import { type StrictEventEmitter } from 'strict-event-emitter-types';
import { EmulatedSensor } from './EmulatedSensor.js';

type State =
  | { status: 'initializing' }
  | { status: 'disconnected' }
  | { status: 'searching-for-server'; discoveryInterval: NodeJS.Timeout }
  | {
      status: 'connected-to-server';
      packetNumber: bigint;
      serverIP: string;
      serverPort: number;
      lastReceivedPacketTimestamp: number;
      timeoutCheckInterval: NodeJS.Timeout;
    };

export class TimeoutError extends Error {
  constructor(desired: string, timeout: number) {
    super(`Timed out waiting for ${desired}, waited ${timeout}ms`);
  }
}

type DisconnectReason = TimeoutError | Error;
type SearchStopReason = 'manual' | 'found-server';

interface EmulatedTrackerEvents {
  error: (error: Error) => void;
  ready: (ip: string, port: number) => void;

  'searching-for-server': () => void;
  'stopped-searching-for-server': (reason: SearchStopReason) => void;

  'connected-to-server': (serverIP: string, serverPort: number) => void;
  'disconnected-from-server': (reason: DisconnectReason) => void;

  'server-feature-flags': (flags: ServerFeatureFlags) => void;

  'incoming-packet': (packet: Packet) => void;
  'unknown-incoming-packet': (buf: Buffer) => void;
  'outgoing-packet': (packet: Packet) => void;
}

const SUPPORTED_FIRMWARE_PROTOCOL_VERSION = 13;

export class EmulatedTracker extends (EventEmitter as {
  new (): StrictEventEmitter<EventEmitter, EmulatedTrackerEvents>;
}) {
  private batteryVoltage = 0;
  private batteryPercentage = 0;

  private readonly socket: Socket;
  private state: State = { status: 'initializing' };

  private sensors: EmulatedSensor[] = [];

  constructor(
    private readonly mac: MACAddress,
    private readonly firmware: string,
    private readonly featureFlags: FirmwareFeatureFlags,
    private readonly boardType: BoardType = BoardType.UNKNOWN,
    private readonly mcuType: MCUType = MCUType.UNKNOWN,
    private readonly serverDiscoveryIP = '255.255.255.255',
    private readonly serverDiscoveryPort = 6969,
    private readonly serverTimeout = 5000,
    private readonly autoReconnect = true
  ) {
    super();

    this.socket = createSocket('udp4');
    this.socket.on('message', (msg, addr) => this.handle(msg, addr));
    this.socket.on('error', (err) => this.emit('error', err));
    this.socket.on('error', (err) => {
      if (this.state.status === 'connected-to-server') this.emit('disconnected-from-server', err);
    });
  }

  private disconnectFromServer(reason: DisconnectReason) {
    if (this.state.status === 'searching-for-server') {
      clearInterval(this.state.discoveryInterval);
    }

    this.state = { status: 'disconnected' };
    this.emit('disconnected-from-server', reason);

    if (this.autoReconnect) {
      this.searchForServer();
    }
  }

  unref() {
    this.socket.unref();
  }

  async addSensor(sensorType: SensorType, sensorStatus: SensorStatus) {
    const sensorId = this.sensors.length;

    const sensor = new EmulatedSensor(this, sensorId, sensorType, sensorStatus);
    this.sensors.push(sensor);

    await sensor.sendSensorInfo();

    return sensor;
  }

  private async sendDiscovery() {
    await this.sendPacket(
      new ServerBoundHandshakePacket(
        this.boardType,
        SensorType.UNKNOWN,
        this.mcuType,
        SUPPORTED_FIRMWARE_PROTOCOL_VERSION,
        this.firmware,
        this.mac
      ),
      this.serverDiscoveryPort,
      this.serverDiscoveryIP
    );
  }

  async init() {
    await new Promise<void>((resolve) => this.socket.bind(0, () => resolve()));
    this.socket.setBroadcast(true);

    const addr = this.socket.address();
    this.emit('ready', addr.address, addr.port);

    this.searchForServer();
  }

  searchForServer() {
    this.state = {
      status: 'searching-for-server',
      discoveryInterval: setInterval(() => this.sendDiscovery(), 1000)
    };
    this.emit('searching-for-server');
  }

  stopSearchingForServer() {
    if (this.state.status !== 'searching-for-server') return;

    clearInterval(this.state.discoveryInterval);
    this.state = { status: 'disconnected' };

    this.emit('stopped-searching-for-server', 'manual');
  }

  private log(msg: string) {
    console.log(`[Tracker:${this.mac}] ${msg}`);
  }

  async changeBatteryLevel(batteryVoltage: number, batteryPercentage: number) {
    this.batteryVoltage = batteryVoltage;
    this.batteryPercentage = batteryPercentage;

    await this.sendBatteryLevel();
  }

  async sendBatteryLevel() {
    await this.sendPacketToServer(new ServerBoundBatteryLevelPacket(this.batteryVoltage, this.batteryPercentage));
  }

  async sendRotationData(sensorId: number, dataType: RotationDataType, rotation: Quaternion, accuracyInfo: number) {
    await this.sendPacketToServer(new ServerBoundRotationDataPacket(sensorId, dataType, rotation, accuracyInfo));
  }

  async sendAcceleration(sensorId: number, acceleration: Vector) {
    await this.sendPacketToServer(new ServerBoundAccelPacket(sensorId, acceleration));
  }

  async sendTemperature(sensorId: number, temperature: number) {
    await this.sendPacketToServer(new ServerBoundTemperaturePacket(sensorId, temperature));
  }

  async sendMagnetometerAccuracy(sensorId: number, accuracy: number) {
    await this.sendPacketToServer(new ServerBoundMagnetometerAccuracyPacket(sensorId, accuracy));
  }

  async sendSignalStrength(sensorId: number, signalStrength: number) {
    await this.sendPacketToServer(new ServerBoundSignalStrengthPacket(sensorId, signalStrength));
  }

  async sendUserAction(action: UserAction) {
    await this.sendPacketToServer(new ServerBoundUserActionPacket(action));
  }

  async sendPacketToServer(packet: Packet) {
    if (this.state.status !== 'connected-to-server') return;

    const port = this.state.serverPort;
    const ip = this.state.serverIP;

    await this.sendPacket(packet, port, ip);
  }

  private async sendPacket(packet: Packet, port: number, ip: string) {
    const encoded = packet.encode(this.state.status === 'connected-to-server' ? this.state.packetNumber++ : 0n);

    await new Promise<void>((res, rej) =>
      this.socket.send(encoded, 0, encoded.length, port, ip, (err) => (err ? rej(err) : res()))
    );

    this.emit('outgoing-packet', packet);
  }

  private async handle(msg: Buffer, addr: RemoteInfo) {
    if (this.state.status === 'initializing' || this.state.status === 'disconnected') return;

    if (this.state.status === 'searching-for-server') {
      if (msg.readUint8(0) !== DeviceBoundHandshakePacket.type) return;

      clearInterval(this.state.discoveryInterval);
      this.emit('stopped-searching-for-server', 'found-server');

      this.state = {
        status: 'connected-to-server',
        packetNumber: 0n,
        serverIP: addr.address,
        serverPort: addr.port,
        lastReceivedPacketTimestamp: Date.now(),
        timeoutCheckInterval: setInterval(() => {
          if (this.state.status !== 'connected-to-server') return;
          if (Date.now() - this.state.lastReceivedPacketTimestamp < this.serverTimeout) return;

          this.disconnectFromServer(new TimeoutError('heartbeat', this.serverTimeout));
        }, 1000).unref()
      };

      await this.sendPacketToServer(new ServerBoundFeatureFlagsPacket(this.featureFlags));
      await this.sendBatteryLevel();
      await Promise.all(this.sensors.map((sensor) => sensor.sendSensorInfo()));

      this.emit('connected-to-server', addr.address, addr.port);

      return;
    }

    if (addr.address !== this.state.serverIP || addr.port !== this.state.serverPort) {
      this.emit('error', new Error(`Received packet from unknown server ${addr.address}:${addr.port}`));
      return;
    }

    const [_num, packet] = parse(msg, true);
    if (packet === null) {
      this.emit('unknown-incoming-packet', msg);
      return;
    }

    this.state.lastReceivedPacketTimestamp = Date.now();

    switch (packet.type) {
      case DeviceBoundPingPacket.type: {
        const pingPacket = packet as DeviceBoundPingPacket;
        this.sendPacketToServer(new ServerBoundPongPacket(pingPacket.id));
        break;
      }

      case DeviceBoundHeartbeatPacket.type: {
        this.sendPacketToServer(new ServerBoundHeartbeatPacket());
        break;
      }

      case DeviceBoundFeatureFlagsPacket.type: {
        const p = packet as DeviceBoundFeatureFlagsPacket;
        this.emit('server-feature-flags', p.flags);
        break;
      }

      case DeviceBoundSensorInfoPacket.type: {
        // Just ignore these packets, they only acknowledge the sensor info we sent
        break;
      }
    }

    this.emit('incoming-packet', packet);
  }
}
