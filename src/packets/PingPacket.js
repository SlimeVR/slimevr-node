const Packet = require('./Packet');

module.exports = class PingPacket extends Packet {
  constructor() {
    super(PingPacket.type);
  }

  static get type() {
    return 1;
  }

  toString() {
    return `PingPacket{}`;
  }

  encode() {
    return Buffer.from([this.type]);
  }
};
