const Packet = require('./Packet');

module.exports = class IncomingCalibrationFinishedPacket extends Packet {
  /**
   * @param {Buffer} data
   */
  constructor(data) {
    super(IncomingCalibrationFinishedPacket.type);

    this.sensorId = data.readUintBE(0, 1) & 0xff;
    this.dataType = data.readInt32BE(1);
  }

  static get type() {
    return 7;
  }

  toString() {
    return `IncomingCalibrationFinishedPacket{sensorId: ${this.sensorId}, dataType: ${this.dataType}}`;
  }
};
