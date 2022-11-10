import { Vector } from '@slimevr/common';
import { Packet } from './Packet';

export class IncomingGyroPacket extends Packet {
  readonly rotation: Vector;

  constructor(number: bigint, data: Buffer) {
    super(number, IncomingGyroPacket.type);

    this.rotation = [data.readFloatBE(0), data.readFloatBE(4), data.readFloatBE(8)];
  }

  static get type() {
    return 2;
  }

  override toString() {
    return `IncomingGyroPacket{rotation: ${this.rotation}}`;
  }
}
