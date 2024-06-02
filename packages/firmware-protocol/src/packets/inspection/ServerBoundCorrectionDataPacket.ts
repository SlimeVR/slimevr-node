import { Quaternion } from '@slimevr/common';
import { PacketWithSensorId } from '../Packet';
import { DataType } from './constants';

export class ServerBoundCorrectionDataPacket extends PacketWithSensorId {
  constructor(sensorId: number, readonly quaternion: Quaternion) {
    super(ServerBoundCorrectionDataPacket.type, sensorId);
  }

  static fromBuffer(data: Buffer) {
    const sensorId = data.readUInt8(0);

    if (data.readUintBE(1, 1) !== DataType.FLOAT) {
      throw new Error('ServerBoundCorrectionDataPacket: data type must be float');
    }

    const quaternion = Quaternion.read(data, 2);

    return new ServerBoundCorrectionDataPacket(sensorId, quaternion);
  }

  static get type() {
    return 0x6903;
  }

  override toString() {
    return `ServerBoundCorrectionDataPacket{sensorId: ${this.sensorId}, quaternion: ${this.quaternion}}`;
  }

  encode(num: bigint): Buffer {
    const buf = Buffer.alloc(4 + 8 + 1 + 4 + this.quaternion.byteLength);

    buf.writeInt32BE(ServerBoundCorrectionDataPacket.type, 0);
    buf.writeBigInt64BE(num, 4);

    buf.writeUInt8(this.sensorId, 12);
    buf.writeUInt8(DataType.FLOAT, 13);
    this.quaternion.write(buf, 14);

    return buf;
  }
}
