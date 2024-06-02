import { Vector } from '@slimevr/common';
import { Packet } from './Packet';

export class ServerBoundGyroPacket extends Packet {
  constructor(readonly rotation: Vector) {
    super(ServerBoundGyroPacket.type);
  }

  static fromBuffer(data: Buffer) {
    const rotation = Vector.readFloatBE(data, 0);

    return new ServerBoundGyroPacket(rotation);
  }

  static get type() {
    return 2;
  }

  override toString() {
    return `ServerBoundGyroPacket{rotation: ${this.rotation}}`;
  }

  encode(number: bigint): Buffer {
    const buf = Buffer.alloc(4 + 8 + this.rotation.byteLength);

    buf.writeInt32BE(this.type, 0);
    buf.writeBigInt64BE(number, 4);

    this.rotation.writeFloatBE(buf, 12);

    return buf;
  }
}
