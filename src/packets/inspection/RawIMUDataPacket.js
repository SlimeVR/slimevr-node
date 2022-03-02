const Packet = require('../Packet');
const constants = require('./constants');

module.exports = class RawIMUDataPacket extends Packet {
  /**
   * @param {Buffer} data
   */
  constructor(data) {
    super(RawIMUDataPacket.type);

    this.sensorId = data.readUInt8(0);

    const dataType = data.readUintBE(1, 1);

    this.rotation = [0, 0, 0];
    this.acceleration = [0, 0, 0];
    this.magnetometer = [0, 0, 0];

    if (dataType === constants.dataType.int) {
      this.rotation = [data.readInt32BE(2), data.readInt32BE(6), data.readInt32BE(10)];
      this.acceleration = [data.readInt32BE(15), data.readInt32BE(19), data.readInt32BE(23)];
      this.magnetometer = [data.readInt32BE(28), data.readInt32BE(32), data.readInt32BE(36)];
    } else if (dataType === constants.dataType.float) {
      this.rotation = [data.readFloatBE(2), data.readFloatBE(6), data.readFloatBE(10)];
      this.acceleration = [data.readFloatBE(15), data.readFloatBE(19), data.readFloatBE(23)];
      this.magnetometer = [data.readFloatBE(28), data.readFloatBE(32), data.readFloatBE(36)];
    } else {
      // console.log(`Unknown data type: ${dataType}`);
    }

    this.rotationAccuracy = data.readUintBE(14, 1);
    this.accelerationAccuracy = data.readUintBE(27, 1);
    this.magnetometerAccuracy = data.readUintBE(40, 1);
  }

  static get type() {
    return 0x6901;
  }

  toString() {
    return `RawIMUDataPacket{sensorId: ${this.sensorId}, rotation: ${this.rotation}, rotationAccuracy: ${this.rotationAccuracy}, acceleration: ${this.acceleration}, accelerationAccuracy: ${this.accelerationAccuracy}, magnetometer: ${this.magnetometer}, magnetometerAccuracy: ${this.magnetometerAccuracy}}`;
  }
};
