import { PacketWithSensorId } from './Packet';

export class ServerBoundCalibrationFinishedPacket extends PacketWithSensorId {
  readonly dataType: number;

  constructor(number: bigint, data: Buffer) {
    super(number, ServerBoundCalibrationFinishedPacket.type, data.readUintBE(0, 1) & 0xff);

    this.dataType = data.readInt32BE(1);
  }

  static get type() {
    return 7;
  }

  override toString() {
    return `ServerBoundCalibrationFinishedPacket{sensorId: ${this.sensorId}, dataType: ${this.dataType}}`;
  }
}
