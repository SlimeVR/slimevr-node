import { PacketWithSensorId } from './Packet';

export class ServerBoundErrorPacket extends PacketWithSensorId {
  readonly reason: number;

  constructor(number: bigint, data: Buffer) {
    super(number, ServerBoundErrorPacket.type, data.readUintBE(0, 1) & 0xff);

    this.reason = data.readUintBE(1, 1);
  }

  static get type() {
    return 14;
  }

  override toString() {
    return `ServerBoundErrorPacket{sensorId: ${this.sensorId}, reason: ${this.reason}}`;
  }
}
