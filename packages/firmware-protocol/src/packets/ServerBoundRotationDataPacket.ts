import { Quaternion } from '@slimevr/common';
import { PacketWithSensorId } from './Packet.js';
import { ServerBoundRotationPacket } from './ServerBoundRotationPacket.js';

export enum RotationDataType {
  NORMAL = 1,
  CORRECTION = 2
}

export class ServerBoundRotationDataPacket extends PacketWithSensorId {
  constructor(
    sensorId: number,
    readonly dataType: RotationDataType,
    readonly rotation: Quaternion,
    readonly accuracyInfo: number
  ) {
    super(ServerBoundRotationDataPacket.type, sensorId);
  }

  static fromBuffer(data: Buffer) {
    const sensorId = data.readUintBE(0, 1) & 0xff;

    const dataType = data.readUintBE(1, 1) & 0xff;
    const rotation = Quaternion.read(data, 2);
    const accuracyInfo = data.readUintBE(18, 1);

    return new ServerBoundRotationDataPacket(sensorId, dataType, rotation, accuracyInfo);
  }

  static get type() {
    return 17;
  }

  static fromRotationPacket(packet: ServerBoundRotationPacket): ServerBoundRotationDataPacket {
    const buf = Buffer.alloc(18);

    // owoTrack only has one IMU so it will always be sensor ID 0
    buf.writeUintBE(0, 0, 1);
    buf.writeUintBE(RotationDataType.NORMAL, 1, 1);

    packet.rotation.write(buf, 2);

    // I'd rather not want to jump through the deserializer
    return ServerBoundRotationDataPacket.fromBuffer(buf);
  }

  override toString() {
    return `ServerBoundRotationDataPacket{sensorId: ${this.sensorId}, dataType: ${
      RotationDataType[this.dataType]
    }, rotation: ${this.rotation}}, accuracyInfo: ${this.accuracyInfo}}`;
  }

  encode(number: bigint): Buffer {
    const buf = Buffer.alloc(4 + 8 + 1 + 1 + this.rotation.byteLength + 1);

    buf.writeInt32BE(ServerBoundRotationDataPacket.type, 0);
    buf.writeBigInt64BE(number, 4);

    buf.writeUintBE(this.sensorId, 12, 1);
    buf.writeUintBE(this.dataType, 13, 1);

    this.rotation.write(buf, 14);

    buf.writeUintBE(this.accuracyInfo, 30, 1);

    return buf;
  }
}
