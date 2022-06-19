import { Packet } from './Packet';

module.exports = class OutgoingPingPacket extends Packet {
  constructor() {
    super(OutgoingPingPacket.type);
  }

  static get type() {
    return 10;
  }

  toString() {
    return 'OutgoingPingPacket{}';
  }

  /**
   * @param {number} data
   */
  encode(data) {
    const buf = Buffer.alloc(16);
    buf.writeInt32BE(this.type, 0);
    buf.writeBigInt64BE(0n, 4);
    buf.writeInt32BE(data, 12);
    return buf;
  }
};
