import { Vector } from '@slimevr/common';
import { Packet } from './Packet';

export class ServerBoundAccelPacket extends Packet {
  readonly acceleration: Vector;
  readonly sensorId: number | null;

  constructor(number: bigint, data: Buffer) {
    super(number, ServerBoundAccelPacket.type);

    this.acceleration = [data.readFloatBE(0), data.readFloatBE(4), data.readFloatBE(8)];

    this.sensorId = data.length >= 12 ? data.readUInt8(12) : null;
  }

  static get type() {
    return 4;
  }

  override toString() {
    return `ServerBoundAccelPacket{acceleration: ${this.acceleration}, sensorId: ${this.sensorId}}`;
  }

  static encode(number: bigint, sensorId: number | null, acceleration: Vector): Buffer {
    const data = Buffer.alloc(4 + 8 + 4 + 4 + 4 + (sensorId !== null ? 1 : 0));

    data.writeInt32BE(ServerBoundAccelPacket.type, 0);
    data.writeBigInt64BE(number, 4);

    data.writeFloatBE(acceleration[0], 12);
    data.writeFloatBE(acceleration[1], 16);
    data.writeFloatBE(acceleration[2], 20);

    if (sensorId !== null) {
      data.writeUInt8(sensorId, 24);
    }

    return data;
  }
}
