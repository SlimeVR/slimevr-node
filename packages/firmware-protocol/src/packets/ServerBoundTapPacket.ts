import { PacketWithSensorId } from './Packet';

export class ServerBoundTapPacket extends PacketWithSensorId {
  readonly value: number;

  constructor(number: bigint, data: Buffer) {
    super(number, ServerBoundTapPacket.type, data.readUintBE(0, 1) & 0xff);

    this.value = data.readUintBE(1, 1);
  }

  static get type() {
    return 13;
  }

  override toString() {
    return `ServerBoundTapPacket{sensorId: ${this.sensorId}, value: ${this.value}}`;
  }
}
