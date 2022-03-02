const Packet = require('./Packet');

module.exports = class HandshakeResponsePacket extends Packet {
  constructor() {
    super(HandshakeResponsePacket.type);
  }

  static get type() {
    return 3;
  }

  toString() {
    return `HandshakeResponsePacket{}`;
  }

  encode() {
    const buf = Buffer.alloc(13);

    buf.writeUInt8(HandshakeResponsePacket.type, 0);

    const l = 'Hey OVR =D 5';
    for (let i = 0; i < l.length; i++) {
      buf.writeUintBE(l[i].charCodeAt(0), i + 1, 1);
    }

    return buf;
  }
};
