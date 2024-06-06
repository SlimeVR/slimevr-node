import { SensorStatus } from '../constants.js';
import { PacketWithSensorId } from './Packet.js';

export class DeviceBoundSensorInfoPacket extends PacketWithSensorId {
  constructor(sensorId: number, readonly sensorStatus: SensorStatus) {
    super(DeviceBoundSensorInfoPacket.type, sensorId);
  }

  static fromBuffer(data: Buffer) {
    const sensorId = data.readUIntBE(0, 1) & 0xff;
    const sensorStatus = data.readUint8(1);

    return new DeviceBoundSensorInfoPacket(sensorId, sensorStatus);
  }

  static get type() {
    return 15;
  }

  override toString() {
    return `DeviceBoundSensorInfoPacket{sensorId: ${this.sensorId}, sensorStatus: ${SensorStatus[this.sensorStatus]}}`;
  }

  encode() {
    const buffer = Buffer.alloc(4 + 1 + 1);

    buffer.writeInt32BE(DeviceBoundSensorInfoPacket.type, 0);

    buffer.writeUInt8(this.sensorId, 4);
    buffer.writeUInt8(this.sensorStatus, 5);

    return buffer;
  }
}
