import { PacketWithSensorId } from './Packet';

export class ServerBoundSignalStrengthPacket extends PacketWithSensorId {
  readonly signalStrength: number;

  constructor(number: bigint, data: Buffer) {
    super(number, ServerBoundSignalStrengthPacket.type, data.readUintBE(0, 1) & 0xff);

    this.signalStrength = data.readIntBE(1, 1);
  }

  static get type() {
    return 19;
  }

  override toString() {
    return `ServerBoundSignalStrengthPacket{sensorId: ${this.sensorId}, signalStrength: ${this.signalStrength}}`;
  }
}
