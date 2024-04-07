import { Quaternion } from '@slimevr/common';
import { Packet } from './Packet';

export class ServerBoundRotationPacket extends Packet {
  readonly rotation: Quaternion;

  constructor(number: bigint, data: Buffer) {
    super(number, ServerBoundRotationPacket.type);

    this.rotation = [data.readFloatBE(0), data.readFloatBE(4), data.readFloatBE(8), data.readFloatBE(12)];
  }

  static get type() {
    return 1;
  }

  override toString() {
    return `ServerBoundRotationPacket{rotation: ${this.rotation}}`;
  }
}
