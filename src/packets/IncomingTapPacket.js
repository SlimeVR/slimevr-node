const Packet = require('./Packet');

module.exports = class IncomingTapPacket extends Packet {
  /**
   * @param {Buffer} data
   */
  constructor(data) {
    super(IncomingTapPacket.type);

    this.sensorId = data.readUintBE(0, 1) & 0xff;
    this.value = data.readUintBE(1, 1);
  }

  static get type() {
    return 13;
  }

  toString() {
    return `IncomingTapPacket{sensorId: ${this.sensorId}, value: ${this.value}}`;
  }
};
