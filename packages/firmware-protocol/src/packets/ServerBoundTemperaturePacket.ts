import { PacketWithSensorId } from './Packet.js';

export class ServerBoundTemperaturePacket extends PacketWithSensorId {
  constructor(sensorId: number, readonly temperature: number) {
    super(ServerBoundTemperaturePacket.type, sensorId);
  }

  static fromBuffer(data: Buffer) {
    const sensorId = data.readUintBE(0, 1) & 0xff;
    const temperature = data.readFloatBE(1);

    return new ServerBoundTemperaturePacket(sensorId, temperature);
  }

  static get type() {
    return 20;
  }

  override toString() {
    return `ServerBoundTemperaturePacket{sensorId: ${this.sensorId}, temperature: ${this.temperature}}`;
  }

  encode(num: bigint): Buffer {
    const buf = Buffer.alloc(4 + 8 + 1 + 4);

    buf.writeInt32BE(ServerBoundTemperaturePacket.type, 0);
    buf.writeBigInt64BE(num, 4);

    buf.writeUInt8(this.sensorId, 12);
    buf.writeFloatBE(this.temperature, 13);

    return buf;
  }
}
