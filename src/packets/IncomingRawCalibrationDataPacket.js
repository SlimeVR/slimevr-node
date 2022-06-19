import { Packet } from './Packet';

module.exports = class IncomingRawCalibrationDataPacket extends Packet {
  /**
   * @param {Buffer} data
   */
  constructor(data) {
    super(IncomingRawCalibrationDataPacket.type);

    this.sensorId = data.readUintBE(0, 1) & 0xff;
    this.dataType = data.readInt32BE(1);

    this.data = [data.readFloatBE(5), data.readFloatBE(9), data.readFloatBE(13)];
  }

  static get type() {
    return 6;
  }

  static get internalGyro() {
    return 1;
  }

  static get internalAccel() {
    return 2;
  }

  static get internalMag() {
    return 3;
  }

  static get externalAll() {
    return 4;
  }

  static get externalGyro() {
    return 5;
  }

  static get externalAccel() {
    return 6;
  }

  static get externalMag() {
    return 7;
  }

  toString() {
    return `IncomingRawCalibrationDataPacket{sensorId: ${this.sensorId}, dataType: ${this.dataType}, data: ${this.data}}`;
  }
};
