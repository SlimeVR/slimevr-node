import { PacketWithSensorId } from './Packet.js';

export class ServerBoundTapPacket extends PacketWithSensorId {
  constructor(sensorId: number, readonly value: number) {
    super(ServerBoundTapPacket.type, sensorId);
  }

  static fromBuffer(data: Buffer) {
    const sensorId = data.readUintBE(0, 1) & 0xff;
    const value = data.readUintBE(1, 1);

    return new ServerBoundTapPacket(sensorId, value);
  }

  static get type() {
    return 13;
  }

  override toString() {
    return `ServerBoundTapPacket{sensorId: ${this.sensorId}, value: ${this.value}}`;
  }

  encode(num: bigint): Buffer {
    const buf = Buffer.alloc(4 + 8 + 1 + 1);

    buf.writeInt32BE(ServerBoundTapPacket.type, 0);
    buf.writeBigInt64BE(num, 4);

    buf.writeUInt8(this.sensorId, 12);
    buf.writeUInt8(this.value, 13);

    return buf;
  }
}
