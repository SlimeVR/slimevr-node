import { MACAddress, Quaternion, Vector } from '@slimevr/common';
import {
  BoardType,
  DeviceBoundFeatureFlagsPacket,
  DeviceBoundHandshakePacket,
  DeviceBoundHeartbeatPacket,
  DeviceBoundPingPacket,
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
import { AddressInfo } from 'net';
import { type StrictEventEmitter } from 'strict-event-emitter-types';
import { EmulatedSensor } from './EmulatedSensor';

type State =
  | { status: 'initializing' }
  | { status: 'searching-for-server'; discoveryInterval: NodeJS.Timeout }
  | { status: 'connected-to-server'; packetNumber: bigint; serverIP: string; serverPort: number };

interface EmulatedTrackerEvents {
  error: (error: Error) => void;
  ready: (address: AddressInfo) => void;
  'connected-to-server': (serverIP: string, serverPort: number) => void;
  'server-feature-flags': (flags: ServerFeatureFlags) => void;
  'unknown-incoming-packet': (packet: Packet) => void;
  'outgoing-packet': (packet: Packet) => void;
}

const SUPPORTED_FIRMWARE_PROTOCOL_VERSION = 13;

export class EmulatedTracker extends (EventEmitter as {
  new (): StrictEventEmitter<EventEmitter, EmulatedTrackerEvents>;
}) {
  // TODO: Implement timing out the server connection if no packets are received for a while
  private lastPacket = Date.now();
  private lastPing = {
    id: 0,
    startTimestamp: 0,
    duration: 0
  };

  private batteryVoltage = 0;
  private batteryPercentage = 0;

  private readonly socket: Socket;
  private state: State;

  private sensors: EmulatedSensor[] = [];

  constructor(
    private readonly mac: MACAddress,
    private readonly firmware: string,
    private readonly featureFlags: FirmwareFeatureFlags,
    private readonly boardType: BoardType = BoardType.UNKNOWN,
    private readonly mcuType: MCUType = MCUType.UNKNOWN,
    private readonly serverDiscoveryIP = '255.255.255.255',
    private readonly serverDiscoveryPort = 6969
  ) {
    super();

    this.socket = createSocket('udp4');
    this.socket.on('message', (msg, addr) => this.handle(msg, addr));
    this.socket.on('error', (err) => this.emit('error', err));

    this.state = { status: 'initializing' };

    this.on('connected-to-server', async () => {
      await this.sendPacketToServer(new ServerBoundFeatureFlagsPacket(this.featureFlags));
      await this.sendBatteryLevel();
      await Promise.all(this.sensors.map((sensor) => sensor.sendSensorInfo()));
    });
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

    this.emit('ready', this.socket.address());

    this.state = {
      status: 'searching-for-server',
      discoveryInterval: setInterval(() => this.sendDiscovery(), 1000)
    };
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
    this.emit('outgoing-packet', packet);

    const encoded = packet.encode(this.state.status === 'connected-to-server' ? this.state.packetNumber++ : 0n);

    await new Promise<void>((res, rej) =>
      this.socket.send(encoded, 0, encoded.length, port, ip, (err) => (err ? rej(err) : res()))
    );

    this.log(`Sent packet to ${ip}:${port} (${encoded.length} bytes): ${encoded.toString('hex')}`);
  }

  private handle(msg: Buffer, addr: RemoteInfo) {
    if (this.state.status === 'searching-for-server') {
      if (msg.readUint8(0) !== DeviceBoundHandshakePacket.type) return;

      clearInterval(this.state.discoveryInterval);

      this.state = {
        status: 'connected-to-server',
        packetNumber: 0n,
        serverIP: addr.address,
        serverPort: addr.port
      };

      this.emit('connected-to-server', addr.address, addr.port);

      return;
    }

    const [_num, packet] = parse(msg, true);
    if (packet === null) {
      this.log(`Received unknown packet (${msg.length} bytes): ${msg.toString('hex')}`);

      return;
    }

    this.lastPacket = Date.now();

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

      default:
        this.emit('unknown-incoming-packet', packet);
    }
  }
}
