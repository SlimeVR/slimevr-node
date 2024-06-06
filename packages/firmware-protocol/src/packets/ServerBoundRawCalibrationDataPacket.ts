import { Vector } from '@slimevr/common';
import { RawCalibrationDataType } from '../constants.js';
import { PacketWithSensorId } from './Packet.js';

export class ServerBoundRawCalibrationDataPacket extends PacketWithSensorId {
  constructor(sensorId: number, readonly dataType: RawCalibrationDataType, readonly data: Vector) {
    super(ServerBoundRawCalibrationDataPacket.type, sensorId);
  }

  static fromBuffer(data: Buffer) {
    const sensorId = data.readUIntBE(0, 1) & 0xff;
    const dataType = data.readInt32BE(1);
    const calibrationData = Vector.readFloatBE(data, 5);

    return new ServerBoundRawCalibrationDataPacket(sensorId, dataType, calibrationData);
  }

  static get type() {
    return 6;
  }

  override toString() {
    return `ServerBoundRawCalibrationDataPacket{sensorId: ${this.sensorId}, dataType: ${
      RawCalibrationDataType[this.dataType]
    }, data: ${this.data}}`;
  }

  encode(num: bigint): Buffer {
    const buf = Buffer.alloc(4 + 8 + 1 + 4 + this.data.byteLength);

    buf.writeInt32BE(ServerBoundRawCalibrationDataPacket.type, 0);
    buf.writeBigInt64BE(num, 4);

    buf.writeUInt8(this.sensorId, 12);
    buf.writeInt32BE(this.dataType, 13);
    this.data.writeFloatBE(buf, 17);

    return buf;
  }
}
