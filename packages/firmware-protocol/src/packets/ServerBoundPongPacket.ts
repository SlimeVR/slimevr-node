import { Packet } from './Packet';

export class ServerBoundPongPacket extends Packet {
  constructor(readonly id: number) {
    super(ServerBoundPongPacket.type);
  }

  static fromBuffer(data: Buffer) {
    const id = data.readInt32BE(0);

    return new ServerBoundPongPacket(id);
  }

  static get type() {
    return 10;
  }

  override toString() {
    return `ServerBoundPongPacket{id: ${this.id}}`;
  }

  encode(num: bigint): Buffer {
    const buf = Buffer.alloc(4 + 8 + 4);

    buf.writeInt32BE(ServerBoundPongPacket.type, 0);
    buf.writeBigUInt64BE(num, 4);
    buf.writeInt32BE(this.id, 12);

    return buf;
  }
}
