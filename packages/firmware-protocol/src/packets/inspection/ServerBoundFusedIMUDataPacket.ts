import { Quaternion } from '@slimevr/common';
import { PacketWithSensorId } from '../Packet';
import { DataType } from './constants';

export class ServerBoundFusedIMUDataPacket extends PacketWithSensorId {
  constructor(sensorId: number, readonly quaternion: Quaternion) {
    super(ServerBoundFusedIMUDataPacket.type, sensorId);
  }

  static fromBuffer(data: Buffer) {
    const sensorId = data.readUInt8(0);

    if (data.readUintBE(1, 1) !== DataType.FLOAT) {
      throw new Error('ServerBoundFusedIMUDataPacket: data type must be float');
    }

    const quaternion = Quaternion.read(data, 2);

    return new ServerBoundFusedIMUDataPacket(sensorId, quaternion);
  }

  static get type() {
    return 0x6902;
  }

  override toString() {
    return `ServerBoundFusedIMUDataPacket{sensorId: ${this.sensorId}, quaternion: ${this.quaternion}}`;
  }

  encode(num: bigint): Buffer {
    const buf = Buffer.alloc(4 + 8 + 1 + 4 + this.quaternion.byteLength);

    buf.writeInt32BE(ServerBoundFusedIMUDataPacket.type, 0);
    buf.writeBigInt64BE(num, 4);

    buf.writeUInt8(this.sensorId, 12);
    buf.writeUInt8(DataType.FLOAT, 13);
    this.quaternion.write(buf, 14);

    return buf;
  }
}
