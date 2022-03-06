const Packet = require('../Packet');
const constants = require('./constants');

module.exports = class CorrectionDataPacket extends Packet {
  /**
   * @param {Buffer} data
   */
  constructor(data) {
    super(CorrectionDataPacket.type);

    this.sensorId = data.readUInt8(0);

    if (data.readUintBE(1, 1) !== constants.dataType.float) {
      throw new Error('CorrectionDataPacket: data type must be float');
    }

    this.quaternion = [data.readFloatBE(2), data.readFloatBE(6), data.readFloatBE(10), data.readFloatBE(14)];
  }

  static get type() {
    return 0x6903;
  }

  toString() {
    return `CorrectionDataPacket{sensorId: ${this.sensorId}, quaternion: ${this.quaternion}}`;
  }
};
