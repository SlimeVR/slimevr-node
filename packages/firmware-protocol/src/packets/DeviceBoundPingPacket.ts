import { Packet } from './Packet';

export class DeviceBoundPingPacket extends Packet {
  constructor(number: bigint, readonly id: number) {
    super(number, DeviceBoundPingPacket.type);
  }

  static get type() {
    return 10;
  }

  override toString() {
    return `DeviceBoundPingPacket{id: ${this.id}}`;
  }

  encode() {
    const buf = Buffer.alloc(16);
    buf.writeInt32BE(this.type, 0);
    buf.writeBigInt64BE(0n, 4);
    buf.writeInt32BE(this.id, 12);
    return buf;
  }
}
