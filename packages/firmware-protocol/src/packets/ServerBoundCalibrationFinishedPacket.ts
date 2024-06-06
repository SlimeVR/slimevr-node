import { PacketWithSensorId } from './Packet.js';

export class ServerBoundCalibrationFinishedPacket extends PacketWithSensorId {
  constructor(sensorId: number, readonly dataType: number) {
    super(ServerBoundCalibrationFinishedPacket.type, sensorId);
  }

  static fromBuffer(data: Buffer) {
    const sensorId = data.readUintBE(0, 1) & 0xff;
    const dataType = data.readInt32BE(1);

    return new ServerBoundCalibrationFinishedPacket(sensorId, dataType);
  }

  static get type() {
    return 7;
  }

  override toString() {
    return `ServerBoundCalibrationFinishedPacket{sensorId: ${this.sensorId}, dataType: ${this.dataType}}`;
  }

  encode(num: bigint): Buffer {
    const buf = Buffer.alloc(4 + 8 + 1 + 4);

    buf.writeInt32BE(ServerBoundCalibrationFinishedPacket.type, 0);
    buf.writeBigInt64BE(num, 4);

    buf.writeUInt8(this.sensorId, 12);
    buf.writeInt32BE(this.dataType, 13);

    return buf;
  }
}
