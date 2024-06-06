import { Packet } from './Packet.js';

export class DeviceBoundPingPacket extends Packet {
  constructor(readonly id: number) {
    super(DeviceBoundPingPacket.type);
  }
  static fromBuffer(data: Buffer) {
    const id = data.readInt32BE(0);

    return new DeviceBoundPingPacket(id);
  }

  static get type() {
    return 10;
  }

  override toString() {
    return `DeviceBoundPingPacket{id: ${this.id}}`;
  }

  encode(num: bigint) {
    const buf = Buffer.alloc(4 + 8 + 4);

    buf.writeInt32BE(this.type, 0);
    buf.writeBigInt64BE(num, 4);

    buf.writeInt32BE(this.id, 12);

    return buf;
  }
}
