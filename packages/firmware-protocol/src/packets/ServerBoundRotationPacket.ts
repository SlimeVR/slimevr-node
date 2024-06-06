import { Quaternion } from '@slimevr/common';
import { Packet } from './Packet.js';

export class ServerBoundRotationPacket extends Packet {
  constructor(readonly rotation: Quaternion) {
    super(ServerBoundRotationPacket.type);
  }

  static fromBuffer(data: Buffer) {
    const rotation = Quaternion.read(data, 0);

    return new ServerBoundRotationPacket(rotation);
  }

  static get type() {
    return 1;
  }

  override toString() {
    return `ServerBoundRotationPacket{rotation: ${this.rotation}}`;
  }

  encode(num: bigint) {
    const buf = Buffer.alloc(4 + 8 + 4 * 4);

    buf.writeInt32BE(this.type, 0);
    buf.writeBigInt64BE(num, 4);

    this.rotation.write(buf, 12);

    return buf;
  }
}
