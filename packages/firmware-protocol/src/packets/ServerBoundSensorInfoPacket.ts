import { SensorStatus, SensorType } from '../constants';
import { PacketWithSensorId } from './Packet';

export class ServerBoundSensorInfoPacket extends PacketWithSensorId {
  constructor(sensorId: number, readonly sensorStatus: SensorStatus, readonly sensorType: SensorType) {
    super(ServerBoundSensorInfoPacket.type, sensorId);
  }

  static fromBuffer(data: Buffer) {
    const sensorId = data.readUintBE(0, 1) & 0xff;
    const sensorStatus = data.readUintBE(1, 1) & 0xff;
    let sensorType = SensorType.UNKNOWN;

    if (data.length >= 3) {
      const rawSensorType = data.readUintBE(2, 1);

      if (rawSensorType > 0 && rawSensorType < 10) {
        sensorType = rawSensorType;
      }
    }

    return new ServerBoundSensorInfoPacket(sensorId, sensorStatus, sensorType);
  }

  static get type() {
    return 15;
  }

  encode(num: bigint): Buffer {
    const buf = Buffer.alloc(4 + 8 + 1 + 1 + 1);

    buf.writeInt32BE(ServerBoundSensorInfoPacket.type, 0);
    buf.writeBigInt64BE(num, 4);

    buf.writeUInt8(this.sensorId, 12);
    buf.writeUInt8(this.sensorStatus, 13);
    buf.writeUInt8(this.sensorType, 14);

    return buf;
  }

  override toString() {
    return `ServerBoundSensorInfoPacket{sensorId: ${this.sensorId}, sensorStatus: ${
      SensorStatus[this.sensorStatus]
    }, sensorType: ${SensorType[this.sensorType]}}`;
  }
}
