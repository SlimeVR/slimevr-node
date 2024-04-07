import { PacketWithSensorId } from './Packet';

export class ServerBoundMagnetometerAccuracyPacket extends PacketWithSensorId {
  readonly accuracy: number;

  constructor(number: bigint, data: Buffer) {
    super(number, ServerBoundMagnetometerAccuracyPacket.type, data.readUintBE(0, 1) & 0xff);

    this.accuracy = data.readFloatBE(1);
  }

  static get type() {
    return 18;
  }

  override toString() {
    return `ServerBoundMagnetometerAccuracyPacket{sensorId: ${this.sensorId}, accuracy: ${this.accuracy}}`;
  }
}
