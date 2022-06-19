import { Packet } from './Packet';

module.exports = class OutgoingHandshakePacket extends Packet {
  constructor() {
    super(OutgoingHandshakePacket.type);
  }

  static get type() {
    return 3;
  }

  toString() {
    return 'OutgoingHandshakePacket{}';
  }

  encode() {
    const buf = Buffer.alloc(14);
    buf.writeUint8(this.type);
    buf.write('Hey OVR =D 5', 1, 'ascii');

    return buf;
  }
};
