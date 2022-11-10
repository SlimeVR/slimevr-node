import { PacketWithSensorId } from './Packet';

export class IncomingTapPacket extends PacketWithSensorId {
  readonly value: number;

  constructor(number: bigint, data: Buffer) {
    super(number, IncomingTapPacket.type, data.readUintBE(0, 1) & 0xff);

    this.value = data.readUintBE(1, 1);
  }

  static get type() {
    return 13;
  }

  override toString() {
    return `IncomingTapPacket{sensorId: ${this.sensorId}, value: ${this.value}}`;
  }
}
