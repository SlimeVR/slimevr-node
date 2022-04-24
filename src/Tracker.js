// @ts-check

const ConnectionTracker = require('./ConnectionTracker');
const FS = require('node:fs');
const IncomingBatteryLevelPacket = require('./packets/IncomingBatteryLevelPacket');
const IncomingCorrectionDataPacket = require('./packets/inspection/IncomingCorrectionDataPacket');
const IncomingErrorPacket = require('./packets/IncomingErrorPacket');
const IncomingFusedIMUDataPacket = require('./packets/inspection/IncomingFusedIMUDataPacket');
const IncomingHandshakePacket = require('./packets/IncomingHandshakePacket');
const IncomingHeartbeatPacket = require('./packets/IncomingHeartbeatPacket');
const IncomingPongPacket = require('./packets/IncomingPongPacket');
const IncomingRawIMUDataPacket = require('./packets/inspection/IncomingRawIMUDataPacket');
const IncomingRotationDataPacket = require('./packets/IncomingRotationDataPacket');
const IncomingSensorInfoPacket = require('./packets/IncomingSensorInfoPacket');
const IncomingSignalStrengthPacket = require('./packets/IncomingSignalStrengthPacket');
const OutgoingHandshakeResponsePacket = require('./packets/OutgoingHandshakePacket');
const OutgoingPingPacket = require('./packets/OutgoingPingPacket');
const OutgoingSensorInfoPacket = require('./packets/OutgoingSensorInfoPacket');
const { protocol } = require('./constants');
const Sensor = require('./Sensor');
const Packet = require('./packets/Packet');
const PacketParser = require('./packets/PacketParser');
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
  rotationDataPacketDumpFile,
  shouldDumpCorrectionDataRaw,
  shouldDumpCorrectionDataProcessed,
  correctionDataDumpFile
} = require('./utils');
const IncomingTemperaturePacket = require('./packets/IncomingTemperaturePacket');
const IncomingAccelPacket = require('./packets/IncomingAccelPacket');
const IncomingRawCalibrationDataPacket = require('./packets/IncomingRawCalibrationDataPacket');
const IncomingCalibrationFinishedPacket = require('./packets/IncomingCalibrationFinishedPacket');
const IncomingMagnetometerAccuracyPacket = require('./packets/IncomingMagnetometerAccuracy');

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
    this.correctedRotation = new VectorAggregator(4);
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

    if (correctionDataDumpFile()) {
      this._log(`Dumping correction data to ${correctionDataDumpFile()}`);

      this.correctionDataRawStream = FS.createWriteStream(correctionDataDumpFile(), 'utf8');
      this.correctionDataRawStream.write('timestamp,x,y,z,w\n');
    } else {
      this.correctionDataRawStream = null;
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
    const packet = PacketParser.parse(msg, this);
    if (packet === null) {
      this._log(`Received unknown packet (${msg.length} bytes): ${msg.toString('hex')}`);

      return;
    }

    this.lastPacket = Date.now();

    this._log(packet.toString());

    switch (packet.type) {
      case IncomingHeartbeatPacket.type: {
        this._log(`Received heartbeat`);

        break;
      }

      case IncomingHandshakePacket.type: {
        const handshake = /** @type {IncomingHandshakePacket} */ (packet);

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
          this.handleSensorPacket({ type: IncomingSensorInfoPacket.type, sensorId: 0, sensorType: handshake.imuType, sensorStatus: 1 });
        }

        this.server.send(new OutgoingHandshakeResponsePacket().encode(), this.port, this.ip);

        break;
      }

      case IncomingAccelPacket.type: {
        const accel = /** @type {IncomingAccelPacket} */ (packet);

        this._log(`Acceleration: ${accel.acceleration.join(', ')}`);

        break;
      }

      case IncomingRawCalibrationDataPacket.type: {
        const rawCalibrationData = /** @type {IncomingRawCalibrationDataPacket} */ (packet);

        this.handleSensorPacket(rawCalibrationData);

        break;
      }

      case IncomingCalibrationFinishedPacket.type: {
        const calibrationFinished = /** @type {IncomingCalibrationFinishedPacket} */ (packet);

        this.handleSensorPacket(calibrationFinished);

        break;
      }

      case IncomingPongPacket.type: {
        const pong = /** @type {IncomingPongPacket} */ (packet);

        if (pong.pingId !== this.lastPingId + 1) {
          this._log(`Ping ID does not match, ignoring`);
        } else {
          this._log(`Received pong`);

          this.lastPingId = pong.pingId;
        }

        break;
      }

      case IncomingBatteryLevelPacket.type: {
        const batteryLevel = /** @type {IncomingBatteryLevelPacket} */ (packet);

        this.batteryVoltage = batteryLevel.voltage;
        this.batteryPercentage = batteryLevel.percentage;

        this._log(`Battery level changed to ${this.batteryVoltage}V (${this.batteryPercentage}%)`);

        break;
      }

      case IncomingErrorPacket.type: {
        const error = /** @type {IncomingErrorPacket} */ (packet);

        this.handleSensorPacket(error);

        break;
      }

      case IncomingSensorInfoPacket.type: {
        const sensorInfo = /** @type {IncomingSensorInfoPacket} */ (packet);

        this._log(`Received sensor info`);

        this.handleSensorPacket(sensorInfo);

        this.server.send(new OutgoingSensorInfoPacket(sensorInfo.sensorId, sensorInfo.sensorStatus).encode(), this.port, this.ip);

        break;
      }

      case IncomingRotationDataPacket.type: {
        const rotation = /** @type {IncomingRotationDataPacket} */ (packet);

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

      case IncomingMagnetometerAccuracyPacket.type: {
        const magnetometerAccuracy = /** @type {IncomingMagnetometerAccuracyPacket} */ (packet);

        this.handleSensorPacket(magnetometerAccuracy);

        break;
      }

      case IncomingSignalStrengthPacket.type: {
        const signalStrength = /** @type {IncomingSignalStrengthPacket} */ (packet);

        this.signalStrength = signalStrength.signalStrength;

        this._log(`Signal strength changed to ${this.signalStrength}`);

        break;
      }

      case IncomingTemperaturePacket.type: {
        const temperature = /** @type {IncomingTemperaturePacket} */ (packet);

        this.handleSensorPacket(temperature);

        break;
      }

      case IncomingRawIMUDataPacket.type: {
        const raw = /** @type {IncomingRawIMUDataPacket} */ (packet);

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

      case IncomingFusedIMUDataPacket.type: {
        const fused = /** @type {IncomingFusedIMUDataPacket} */ (packet);

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

      case IncomingCorrectionDataPacket.type: {
        const correction = /** @type {IncomingCorrectionDataPacket} */ (packet);

        if (shouldDumpCorrectionDataRaw()) {
          this._log(correction.toString());
        }

        this.correctedRotation.update(correction.quaternion);

        if (shouldDumpCorrectionDataProcessed()) {
          this._log(`Correction | ${this.correctedRotation.toString()}`);
        }

        if (this.correctionDataRawStream !== null) {
          const csv = [Date.now(), ...correction.quaternion].join(',') + '\n';
          this.correctionDataRawStream.write(csv);
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

    if (this.packetNumber < packetNumber) {
      return false;
    }

    this.packetNumber = packetNumber;

    return true;
  }

  ping() {
    this.server.send(new OutgoingPingPacket().encode(this.lastPingId + 1), this.port, this.ip);

    this._log('Sent ping');
  }

  /**
   * @param {Packet & {sensorId: number}} packet
   */
  handleSensorPacket(packet) {
    let sensor = this.sensors[packet.sensorId];

    if (!sensor) {
      this._log(`Setting up sensor ${packet.sensorId}`);

      if (!(packet instanceof IncomingSensorInfoPacket)) {
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
