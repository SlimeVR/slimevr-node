const Packet = require('./Packet');

module.exports = class IncomingErrorPacket extends Packet {
  /**
   * @param {Buffer} data
   */
  constructor(data) {
    super(IncomingErrorPacket.type);

    this.sensorId = data.readUintBE(0, 1);
    this.reason = data.readUintBE(1, 1);
  }

  static get type() {
    return 14;
  }

  toString() {
    return `IncomingErrorPacket{sensorId: ${this.sensorId}, reason: ${this.reason}}`;
  }
};
