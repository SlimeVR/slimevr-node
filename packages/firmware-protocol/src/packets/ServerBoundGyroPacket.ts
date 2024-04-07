import { Vector } from '@slimevr/common';
import { Packet } from './Packet';

export class ServerBoundGyroPacket extends Packet {
  readonly rotation: Vector;

  constructor(number: bigint, data: Buffer) {
    super(number, ServerBoundGyroPacket.type);

    this.rotation = [data.readFloatBE(0), data.readFloatBE(4), data.readFloatBE(8)];
  }

  static get type() {
    return 2;
  }

  override toString() {
    return `ServerBoundGyroPacket{rotation: ${this.rotation}}`;
  }
}
