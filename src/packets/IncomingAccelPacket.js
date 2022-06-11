const Packet = require('./Packet');

module.exports = class IncomingAccelPacket extends Packet {
  /**
   * @param {Buffer} data
   */
  constructor(data) {
    super(IncomingAccelPacket.type);

    this.acceleration = [data.readFloatBE(0), data.readFloatBE(4), data.readFloatBE(8)];
  }

  static get type() {
    return 4;
  }

  toString() {
    return `IncomingAccelPacket{acceleration: ${this.acceleration}}`;
  }
};
