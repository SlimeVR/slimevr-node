import { SensorStatus } from '../constants';
import { PacketWithSensorId } from './Packet';

export class DeviceBoundSensorInfoPacket extends PacketWithSensorId {
  readonly sensorStatus: SensorStatus;

  constructor(number: bigint, data: Buffer) {
    super(number, DeviceBoundSensorInfoPacket.type, data.readUint8(0));

    this.sensorStatus = data.readUint8(1);
  }

  static get type() {
    return 15;
  }

  override toString() {
    return `DeviceBoundSensorInfoPacket{sensorId: ${this.sensorId}, sensorStatus: ${SensorStatus[this.sensorStatus]}}`;
  }

  static encode(sensorId: number, sensorStatus: SensorStatus) {
    const buffer = Buffer.alloc(4 + 1 + 1);

    buffer.writeInt32BE(DeviceBoundSensorInfoPacket.type, 0);

    buffer.writeUInt8(sensorId, 4);
    buffer.writeUInt8(sensorStatus, 5);

    return buffer;
  }
}
