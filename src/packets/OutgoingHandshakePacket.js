const Packet = require('./Packet');

module.exports = class OutgoingHandshakePacket extends Packet {
  constructor() {
    super(OutgoingHandshakePacket.type);
  }

  static get type() {
    return 3;
  }

  toString() {
    return `OutgoingHandshakePacket{}`;
  }

  encode() {
    const buf = Buffer.alloc(1);
    buf.writeUint8(this.type);
    return buf;
  }
};

