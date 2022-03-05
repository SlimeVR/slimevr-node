// @ts-check

const ConnectionTracker = require('./ConnectionTracker');
const HandshakePacket = require('./packets/HandshakePacket');
const HeartbeatPacket = require('./packets/HeartbeatPacket');
const PacketParser = require('./packets/PacketParser');
const RawIMUDataPacket = require('./packets/inspection/RawIMUDataPacket');
const RotationDataPacket = require('./packets/RotationDataPacket');
const BatteryLevelPacket = require('./packets/BatteryLevelPacket');
const PingPacket = require('./packets/PingPacket');
const { protocol } = require('./constants');
const HandshakeResponsePacket = require('./packets/HandshakeResponsePacket');
const Sensor = require('./Sensor');
const PongPacket = require('./packets/PongPacket');
const SensorInfoPacket = require('./packets/SensorInfoPacket');
const SensorInfoResponsePacket = require('./packets/SensorInfoResponsePacket');
const SignalStrengthPacket = require('./packets/SignalStrengthPacket');
const Packet = require('./packets/Packet');
const ErrorPacket = require('./packets/ErrorPacket');
const VectorAggregator = require('./VectorAggretator');
const {
  shouldDumpRotationDataPacketsProcessed,
  shouldDumpRotationDataPacketsRaw,
  shouldDumpRawIMUDataProcessed,
  shouldDumpRawIMUDataRaw,
  shouldDumpFusedDataRaw,
  shouldDumpFusedDataProcessed,
  fusedIMUDataDumpFile,
  rawIMUDataDumpFile,
  rotationDataPacketDumpFile
} = require('./utils');
const FusedIMUDataPacket = require('./packets/inspection/FusedIMUDataPacket');
const FS = require('node:fs');

module.exports = class Tracker {
  /**
   * @param {import('dgram').Socket} server
   * @param {string} ip
   * @param {number} port
   */
  constructor(server, ip, port) {
    this.server = server;
    this.ip = ip;
    this.port = port;

    this.packetNumber = BigInt(0);
    this.handshook = false;
    this.lastPacket = Date.now();
    this.lastPingId = 0;

    this.mac = '';
    this.firmwareBuild = -1;
    this.protocol = protocol.UNKNOWN;

    this.sensors = [];
    this.signalStrength = 0;
    this.batteryVoltage = 0;
    this.batteryPercentage = 0;

    this.rotation = new VectorAggregator(4);
    this.fusedRotation = new VectorAggregator(4);
    this.rawRotation = new VectorAggregator(3);
    this.rawAcceleration = new VectorAggregator(3);
    this.rawMagnetometer = new VectorAggregator(3);

    if (rotationDataPacketDumpFile() !== '') {
      this._log(`Dumping rotation data to ${rotationDataPacketDumpFile()}`);

      this.rotationDataPacketStream = FS.createWriteStream(rotationDataPacketDumpFile(), 'utf8');
      this.rotationDataPacketStream.write('timestamp,x,y,z,w\n');
    } else {
      this.rotationDataPacketStream = null;
    }

    if (rawIMUDataDumpFile() !== '') {
      this._log(`Dumping raw IMU data to ${rawIMUDataDumpFile()}`);

      this.rawIMUDataRawStream = FS.createWriteStream(rawIMUDataDumpFile(), 'utf8');
      this.rawIMUDataRawStream.write('timestamp,rX,rY,rZ,rA,aX,aY,aZ,aAmX,mY,mZ,mA\n');
    } else {
      this.rawIMUDataRawStream = null;
    }

    if (fusedIMUDataDumpFile() !== '') {
      this._log(`Dumping fused IMU data to ${fusedIMUDataDumpFile()}`);

      this.fusedIMUDataRawStream = FS.createWriteStream(fusedIMUDataDumpFile(), 'utf8');
      this.fusedIMUDataRawStream.write('timestamp,x,y,z,w\n');
    } else {
      this.fusedIMUDataRawStream = null;
    }
  }

  get alive() {
    return this.lastPacket > Date.now() - 1000;
  }

  /**
   * @param {string} msg
   */
  _log(msg) {
    console.log(`[Tracker:${this.ip}] ${msg}`);
  }

  /** @param {Buffer} msg */
  handle(msg) {
    // this._log(`Received message (${msg.length} bytes): ${msg.toString('hex')}`);

    const packet = PacketParser.parse(msg, this);
    if (packet === null) {
      // this._log('Packet is not valid');
      return;
    }

    this.lastPacket = Date.now();

    switch (packet.type) {
      case HeartbeatPacket.type: {
        this._log(`Received heartbeat`);

        break;
      }

      case HandshakePacket.type: {
        const handshake = /** @type {HandshakePacket} */ (packet);

        this._log(`Received handshake`);
        this._log(handshake.toString());

        this.firmwareBuild = handshake.firmwareBuild;
        this.mac = handshake.mac;
        this.protocol = handshake.firmware === '' ? protocol.OWO_LEGACY : protocol.SLIMEVR_RAW;

        const existingConnection = ConnectionTracker.get().getConnectionByMAC(handshake.mac);

        if (existingConnection) {
          this._log(`Removing existing connection for MAC ${handshake.mac}`);
          ConnectionTracker.get().removeConnectionByMAC(handshake.mac);
        }

        ConnectionTracker.get().addConnection(this);

        this.handshook = true;

        if (this.protocol === protocol.OWO_LEGACY) {
          this.handleSensorPacket({ type: SensorInfoPacket.type, sensorId: 0, sensorType: handshake.imuType, sensorStatus: 1 });
        }

        this.server.send(new HandshakeResponsePacket().encode(), this.port, this.ip);

        break;
      }

      case SensorInfoPacket.type: {
        const sensorInfo = /** @type {SensorInfoPacket} */ (packet);

        this._log(`Received sensor info`);

        this.handleSensorPacket(sensorInfo);

        this.server.send(new SensorInfoResponsePacket(sensorInfo.sensorId, sensorInfo.sensorStatus).encode(), this.port, this.ip);

        break;
      }

      case RotationDataPacket.type: {
        const rotation = /** @type {RotationDataPacket} */ (packet);

        if (shouldDumpRotationDataPacketsRaw()) {
          this._log(rotation.toString());
        }

        this.rotation.update(rotation.rotation);

        if (shouldDumpRotationDataPacketsProcessed()) {
          this._log(`RotPac | ${this.rotation.toString()}`);
        }

        if (this.rotationDataPacketStream !== null) {
          const csv = [Date.now(), rotation.rotation[0], rotation.rotation[1], rotation.rotation[2], rotation.rotation[3]].join(',') + '\n';
          this.rotationDataPacketStream.write(csv);
        }

        break;
      }

      case PongPacket.type: {
        const pong = /** @type {PongPacket} */ (packet);

        if (pong.pingId !== this.lastPingId) {
          this._log(`Ping ID does not match, ignoring`);
        } else {
          this._log(`Received pong`);
        }

        break;
      }

      case SignalStrengthPacket.type: {
        const signalStrength = /** @type {SignalStrengthPacket} */ (packet);

        this.signalStrength = signalStrength.signalStrength;

        this._log(`Signal strength changed to ${this.signalStrength}`);

        break;
      }

      case BatteryLevelPacket.type: {
        const batteryLevel = /** @type {BatteryLevelPacket} */ (packet);

        this.batteryVoltage = batteryLevel.voltage;
        this.batteryPercentage = batteryLevel.percentage;

        this._log(`Battery level changed to ${this.batteryVoltage}V (${this.batteryPercentage}%)`);

        break;
      }

      case ErrorPacket.type: {
        const error = /** @type {ErrorPacket} */ (packet);

        this.handleSensorPacket(error);

        break;
      }

      case RawIMUDataPacket.type: {
        const raw = /** @type {RawIMUDataPacket} */ (packet);

        if (shouldDumpRawIMUDataRaw()) {
          this._log(raw.toString());
        }

        this.rawRotation.update(raw.rotation);
        this.rawAcceleration.update(raw.acceleration);
        this.rawMagnetometer.update(raw.magnetometer);

        if (shouldDumpRawIMUDataProcessed()) {
          this._log(`Raw | ROT | ${this.rawRotation.toString()}`);
          this._log(`Raw | ACC | ${this.rawAcceleration.toString()}`);
          this._log(`Raw | MAG | ${this.rawMagnetometer.toString()}`);
        }

        if (this.rawIMUDataRawStream !== null) {
          const csv =
            [
              Date.now(),
              ...raw.rotation,
              raw.rotationAccuracy,
              ...raw.acceleration,
              raw.accelerationAccuracy,
              ...raw.magnetometer,
              raw.magnetometerAccuracy
            ].join(',') + '\n';
          this.rawIMUDataRawStream.write(csv);
        }

        break;
      }

      case FusedIMUDataPacket.type: {
        const fused = /** @type {FusedIMUDataPacket} */ (packet);

        if (shouldDumpFusedDataRaw()) {
          this._log(fused.toString());
        }

        this.fusedRotation.update(fused.quaternion);

        if (shouldDumpFusedDataProcessed()) {
          this._log(`Fused | ${this.fusedRotation.toString()}`);
        }

        if (this.fusedIMUDataRawStream !== null) {
          const csv = [Date.now(), ...fused.quaternion].join(',') + '\n';
          this.fusedIMUDataRawStream.write(csv);
        }

        break;
      }
    }
  }

  /** @param {bigint} packetNumber */
  isNextPacket(packetNumber) {
    if (packetNumber >= BigInt(0)) {
      this.packetNumber = packetNumber;

      return true;
    }

    if (this.packetNumber + BigInt(1) !== packetNumber) {
      return false;
    }

    this.packetNumber = packetNumber;

    return true;
  }

  ping() {
    this.server.send(new PingPacket().encode(), this.port, this.ip);
  }

  /**
   * @param {Packet & {sensorId: number}} packet
   */
  handleSensorPacket(packet) {
    let sensor = this.sensors[packet.sensorId];

    if (!sensor) {
      this._log(`Setting up sensor ${packet.sensorId}`);

      if (!(packet instanceof SensorInfoPacket)) {
        this._log(`Could not handle sensor packet for sensor ${packet.sensorId}`);

        return;
      }

      sensor = new Sensor(this, packet.sensorType, packet.sensorId);
      this.sensors[packet.sensorId] = sensor;

      this._log(`Added sensor ${packet.sensorId}`);
    }

    sensor.handle(packet);
  }
};
