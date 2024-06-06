import { PacketWithSensorId } from './Packet.js';

export class ServerBoundErrorPacket extends PacketWithSensorId {
  constructor(sensorId: number, readonly reason: number) {
    super(ServerBoundErrorPacket.type, sensorId);
  }

  static fromBuffer(data: Buffer) {
    const sensorId = data.readUintBE(0, 1) & 0xff;
    const reason = data.readUintBE(1, 1);

    return new ServerBoundErrorPacket(sensorId, reason);
  }

  static get type() {
    return 14;
  }

  override toString() {
    return `ServerBoundErrorPacket{sensorId: ${this.sensorId}, reason: ${this.reason}}`;
  }

  encode(num: bigint): Buffer {
    const buf = Buffer.alloc(4 + 8 + 1 + 1);

    buf.writeInt32BE(ServerBoundErrorPacket.type, 0);
    buf.writeBigInt64BE(num, 4);

    buf.writeUInt8(this.sensorId, 12);
    buf.writeUInt8(this.reason, 13);

    return buf;
  }
}
