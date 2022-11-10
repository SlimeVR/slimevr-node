import { SensorStatus, SensorType } from '../constants';
import { PacketWithSensorId } from './Packet';

export class ServerBoundSensorInfoPacket extends PacketWithSensorId {
  readonly sensorStatus: SensorStatus;
  readonly sensorType: SensorType;

  constructor(number: bigint, data: Buffer) {
    super(number, ServerBoundSensorInfoPacket.type, data.readUintBE(0, 1) & 0xff);

    this.sensorStatus = data.readUintBE(1, 1) & 0xff;

    this.sensorType = SensorType.UNKNOWN;

    if (data.length >= 3) {
      const rawSensorType = data.readUintBE(2, 1);

      if (rawSensorType > 0 && rawSensorType < 10) {
        this.sensorType = rawSensorType;
      }
    }
  }

  static get type() {
    return 15;
  }

  static encode(number: bigint, sensorId: number, sensorStatus: SensorStatus, sensorType: SensorType): Buffer {
    const buf = Buffer.alloc(4 + 8 + 1 + 1 + 1);

    buf.writeInt32BE(ServerBoundSensorInfoPacket.type, 0);
    buf.writeBigInt64BE(number, 4);

    buf.writeUInt8(sensorId, 12);
    buf.writeUInt8(sensorStatus, 13);
    buf.writeUInt8(sensorType, 14);

    return buf;
  }

  override toString() {
    return `ServerBoundSensorInfoPacket{sensorId: ${this.sensorId}, sensorStatus: ${
      SensorStatus[this.sensorStatus]
    }, sensorType: ${SensorType[this.sensorType]}}`;
  }
}
