import { Packet } from './Packet';

export class DeviceBoundPingPacket extends Packet {
  readonly id: number;
  constructor(number: bigint, data: Buffer) {
    super(number, DeviceBoundPingPacket.type);

    this.id = data.readInt32BE(0);
  }

  static get type() {
    return 10;
  }

  override toString() {
    return `DeviceBoundPingPacket{id: ${this.id}}`;
  }

  static encode(number: bigint, id: number) {
    const buf = Buffer.alloc(4 + 8 + 4);

    buf.writeInt32BE(this.type, 0);
    buf.writeBigInt64BE(number, 4);

    buf.writeInt32BE(id, 12);

    return buf;
  }
}
