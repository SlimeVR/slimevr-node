import { Quaternion } from '@slimevr/common';
import { IncomingRotationPacket } from '.';
import { PacketWithSensorId } from './Packet';

export enum RotationDataType {
  NORMAL = 1,
  CORRECTION = 2
}

export class IncomingRotationDataPacket extends PacketWithSensorId {
  readonly dataType: RotationDataType;

  readonly rotation: Quaternion;

  constructor(data: Buffer) {
    super(IncomingRotationDataPacket.type, data.readUintBE(0, 1) & 0xff);

    this.dataType = data.readUintBE(1, 1) & 0xff;

    this.rotation = [data.readFloatBE(2), data.readFloatBE(6), data.readFloatBE(10), data.readFloatBE(14)];
  }

  static get type() {
    return 17;
  }

  static fromRotationPacket(packet: IncomingRotationPacket): IncomingRotationDataPacket {
    const buf = Buffer.alloc(18);

    // owoTrack only has one IMU so it will always be sensor ID 0
    buf.writeUintBE(0, 0, 1);
    buf.writeUintBE(RotationDataType.NORMAL, 1, 1);
    buf.writeFloatBE(packet.rotation[0], 2);
    buf.writeFloatBE(packet.rotation[1], 6);
    buf.writeFloatBE(packet.rotation[2], 10);
    buf.writeFloatBE(packet.rotation[3], 14);

    // I'd rather not want to jump through the deserializer
    return new IncomingRotationDataPacket(buf);
  }

  override toString() {
    return `IncomingRotationDataPacket{sensorId: ${this.sensorId}, dataType: ${
      RotationDataType[this.dataType]
    }, rotation: ${this.rotation}}`;
  }
}
