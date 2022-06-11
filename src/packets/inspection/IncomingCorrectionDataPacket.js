const Packet = require('../Packet');
const constants = require('./constants');

module.exports = class IncomingCorrectionDataPacket extends Packet {
  /**
   * @param {Buffer} data
   */
  constructor(data) {
    super(IncomingCorrectionDataPacket.type);

    this.sensorId = data.readUInt8(0);

    if (data.readUintBE(1, 1) !== constants.dataType.float) {
      throw new Error('IncomingCorrectionDataPacket: data type must be float');
    }

    this.quaternion = [data.readFloatBE(2), data.readFloatBE(6), data.readFloatBE(10), data.readFloatBE(14)];
  }

  static get type() {
    return 0x6903;
  }

  toString() {
    return `IncomingCorrectionDataPacket{sensorId: ${this.sensorId}, quaternion: ${this.quaternion}}`;
  }
};
