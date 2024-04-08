import { Quaternion, toQuaternion } from '@slimevr/common';
import { ServerBoundRotationPacket } from '.';
import { PacketWithSensorId } from './Packet';

export enum RotationDataType {
  NORMAL = 1,
  CORRECTION = 2
}

export class ServerBoundRotationDataPacket extends PacketWithSensorId {
  readonly dataType: RotationDataType;

  readonly rotation: Quaternion;
  readonly accuracyInfo: number;

  constructor(number: bigint, data: Buffer) {
    super(number, ServerBoundRotationDataPacket.type, data.readUintBE(0, 1) & 0xff);

    this.dataType = data.readUintBE(1, 1) & 0xff;

    this.rotation = [data.readFloatBE(2), data.readFloatBE(6), data.readFloatBE(10), data.readFloatBE(14)];
    this.accuracyInfo = data.readUintBE(18, 1);
  }

  static get type() {
    return 17;
  }

  static fromRotationPacket(packet: ServerBoundRotationPacket): ServerBoundRotationDataPacket {
    const buf = Buffer.alloc(18);

    // owoTrack only has one IMU so it will always be sensor ID 0
    buf.writeUintBE(0, 0, 1);
    buf.writeUintBE(RotationDataType.NORMAL, 1, 1);

    const rotationQuaternion = toQuaternion(packet.rotation);

    buf.writeFloatBE(rotationQuaternion[0], 2);
    buf.writeFloatBE(rotationQuaternion[1], 6);
    buf.writeFloatBE(rotationQuaternion[2], 10);
    buf.writeFloatBE(rotationQuaternion[3], 14);

    // I'd rather not want to jump through the deserializer
    return new ServerBoundRotationDataPacket(packet.number, buf);
  }

  override toString() {
    return `ServerBoundRotationDataPacket{sensorId: ${this.sensorId}, dataType: ${
      RotationDataType[this.dataType]
    }, rotation: ${this.rotation}}, accuracyInfo: ${this.accuracyInfo}}`;
  }

  static encode(
    number: bigint,
    sensorId: number,
    dataType: RotationDataType,
    rotation: Quaternion,
    accuracyInfo: number
  ): Buffer {
    const buf = Buffer.alloc(4 + 8 + 1 + 1 + 4 + 4 + 4 + 4 + 1);

    buf.writeInt32BE(ServerBoundRotationDataPacket.type, 0);
    buf.writeBigInt64BE(number, 4);

    buf.writeUintBE(sensorId, 12, 1);
    buf.writeUintBE(dataType, 13, 1);

    const rotationQuaternion = toQuaternion(rotation);

    buf.writeFloatBE(rotationQuaternion[0], 14);
    buf.writeFloatBE(rotationQuaternion[1], 18);
    buf.writeFloatBE(rotationQuaternion[2], 22);
    buf.writeFloatBE(rotationQuaternion[3], 26);

    buf.writeUintBE(accuracyInfo, 30, 1);

    return buf;
  }
}
