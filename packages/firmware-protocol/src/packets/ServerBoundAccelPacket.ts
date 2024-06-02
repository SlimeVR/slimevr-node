import { Vector } from '@slimevr/common';
import { Packet } from './Packet';

export class ServerBoundAccelPacket extends Packet {
  constructor(readonly sensorId: number | null, readonly acceleration: Vector) {
    super(ServerBoundAccelPacket.type);
  }

  static fromBuffer(data: Buffer) {
    const acceleration = Vector.readFloatBE(data, 0);
    const sensorId = data.length >= 12 ? data.readUInt8(12) : null;

    return new ServerBoundAccelPacket(sensorId, acceleration);
  }

  static get type() {
    return 4;
  }

  override toString() {
    return `ServerBoundAccelPacket{acceleration: ${this.acceleration}, sensorId: ${this.sensorId}}`;
  }

  encode(num: bigint): Buffer {
    const data = Buffer.alloc(4 + 8 + this.acceleration.byteLength + (this.sensorId !== null ? 1 : 0));

    data.writeInt32BE(ServerBoundAccelPacket.type, 0);
    data.writeBigInt64BE(num, 4);

    this.acceleration.writeFloatBE(data, 12);

    if (this.sensorId !== null) data.writeUInt8(this.sensorId, 24);

    return data;
  }
}
