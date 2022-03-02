const Packet = require('./Packet');

module.exports = class ErrorPacket extends Packet {
  /**
   * @param {Buffer} data
   */
  constructor(data) {
    super(ErrorPacket.type);

    this.sensorId = data.readUintBE(0, 1);
    this.reason = data.readUintBE(1, 1);
  }

  static get type() {
    return 14;
  }

  toString() {
    return `ErrorPacket{sensorId: ${this.sensorId}, reason: ${this.reason}}`;
  }
};
