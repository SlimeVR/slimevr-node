import { Quaternion } from '@slimevr/common';
import { Packet } from '../Packet';
import { DataType } from './constants';

export class ServerBoundCorrectionDataPacket extends Packet {
  readonly sensorId: number;
  readonly quaternion: Quaternion;

  constructor(number: bigint, data: Buffer) {
    super(number, ServerBoundCorrectionDataPacket.type);

    this.sensorId = data.readUInt8(0);

    if (data.readUintBE(1, 1) !== DataType.FLOAT) {
      throw new Error('ServerBoundCorrectionDataPacket: data type must be float');
    }

    this.quaternion = [data.readFloatBE(2), data.readFloatBE(6), data.readFloatBE(10), data.readFloatBE(14)];
  }

  static get type() {
    return 0x6903;
  }

  override toString() {
    return `ServerBoundCorrectionDataPacket{sensorId: ${this.sensorId}, quaternion: ${this.quaternion}}`;
  }
}
