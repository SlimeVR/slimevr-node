const Packet = require('./Packet');

module.exports = class IncomingGyroPacket extends Packet {
  /**
   * @param {Buffer} data
   */
  constructor(data) {
    super(IncomingGyroPacket.type);

    this.rotation = [data.readFloatBE(0), data.readFloatBE(4), data.readFloatBE(8)];
  }

  static get type() {
    return 2;
  }

  toString() {
    return `IncomingGyroPacket{rotation: ${this.rotation}}`;
  }
};
