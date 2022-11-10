import { Packet } from './Packet';

export class ServerBoundPongPacket extends Packet {
  readonly id: number;

  constructor(number: bigint, data: Buffer) {
    super(number, ServerBoundPongPacket.type);

    this.id = data.readInt32BE(0);
  }

  static get type() {
    return 10;
  }

  override toString() {
    return `ServerBoundPongPacket{id: ${this.id}}`;
  }

  static encode(number: bigint, id: number): Buffer {
    const buf = Buffer.alloc(4 + 8 + 4);
    buf.writeInt32BE(ServerBoundPongPacket.type, 0);
    buf.writeBigUInt64BE(number, 4);
    buf.writeInt32BE(id, 12);
    return buf;
  }
}
