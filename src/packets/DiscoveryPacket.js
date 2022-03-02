const Packet = require('./Packet');

module.exports = class DiscoveryPacket extends Packet {
  constructor() {
    super(DiscoveryPacket.type);
  }

  static get type() {
    return 0;
  }

  toString() {
    return `DiscoveryPacket{}`;
  }

  encode() {
    return Buffer.from([this.type]);
  }
};
