import { PacketWithSensorId } from './Packet';

export class IncomingCalibrationFinishedPacket extends PacketWithSensorId {
  readonly dataType: number;

  constructor(number: bigint, data: Buffer) {
    super(number, IncomingCalibrationFinishedPacket.type, data.readUintBE(0, 1) & 0xff);

    this.dataType = data.readInt32BE(1);
  }

  static get type() {
    return 7;
  }

  override toString() {
    return `IncomingCalibrationFinishedPacket{sensorId: ${this.sensorId}, dataType: ${this.dataType}}`;
  }
}
