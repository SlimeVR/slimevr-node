const Packet = require('./Packet');

module.exports = class HeartbeatPacket extends Packet {
  constructor() {
    super(HeartbeatPacket.type);
  }

  static get type() {
    return 0;
  }

  toString() {
    return `HeartbeatPacket{}`;
  }

  encode() {
    return Buffer.from([this.type]);
  }
};
