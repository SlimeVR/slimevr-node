import { PacketWithSensorId } from './Packet';

export class ServerBoundMagnetometerAccuracyPacket extends PacketWithSensorId {
  constructor(sensorId: number, readonly accuracy: number) {
    super(ServerBoundMagnetometerAccuracyPacket.type, sensorId);
  }

  static fromBuffer(data: Buffer) {
    const sensorId = data.readUintBE(0, 1) & 0xff;
    const accuracy = data.readFloatBE(1);

    return new ServerBoundMagnetometerAccuracyPacket(sensorId, accuracy);
  }

  static get type() {
    return 18;
  }

  override toString() {
    return `ServerBoundMagnetometerAccuracyPacket{sensorId: ${this.sensorId}, accuracy: ${this.accuracy}}`;
  }

  encode(num: bigint): Buffer {
    const buf = Buffer.alloc(4 + 8 + 1 + 4);

    buf.writeInt32BE(ServerBoundMagnetometerAccuracyPacket.type, 0);
    buf.writeBigInt64BE(num, 4);

    buf.writeUInt8(this.sensorId, 12);
    buf.writeFloatBE(this.accuracy, 13);

    return buf;
  }
}
