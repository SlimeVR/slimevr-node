import { PacketWithSensorId } from './Packet';

export class ServerBoundTemperaturePacket extends PacketWithSensorId {
  readonly temperature: number;

  constructor(number: bigint, data: Buffer) {
    super(number, ServerBoundTemperaturePacket.type, data.readUintBE(0, 1) & 0xff);

    this.temperature = data.readFloatBE(1);
  }

  static get type() {
    return 20;
  }

  override toString() {
    return `ServerBoundTemperaturePacket{sensorId: ${this.sensorId}, temperature: ${this.temperature}}`;
  }
}
