import { PacketWithSensorId } from './Packet.js';

export class ServerBoundSignalStrengthPacket extends PacketWithSensorId {
  constructor(sensorId: number, readonly signalStrength: number) {
    super(ServerBoundSignalStrengthPacket.type, sensorId);
  }

  static fromBuffer(data: Buffer) {
    const sensorId = data.readUIntBE(0, 1) & 0xff;
    const signalStrength = data.readIntBE(1, 1);

    return new ServerBoundSignalStrengthPacket(sensorId, signalStrength);
  }

  static get type() {
    return 19;
  }

  override toString() {
    return `ServerBoundSignalStrengthPacket{sensorId: ${this.sensorId}, signalStrength: ${this.signalStrength}}`;
  }

  encode(num: bigint): Buffer {
    const buf = Buffer.alloc(4 + 8 + 1 + 1);

    buf.writeInt32BE(ServerBoundSignalStrengthPacket.type, 0);
    buf.writeBigInt64BE(num, 4);

    buf.writeUInt8(this.sensorId, 12);
    buf.writeInt8(this.signalStrength, 13);

    return buf;
  }
}
