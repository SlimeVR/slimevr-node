import { Packet } from './Packet';

export class ServerBoundHeartbeatPacket extends Packet {
  constructor(number: bigint) {
    super(number, ServerBoundHeartbeatPacket.type);
  }

  static get type() {
    return 0;
  }

  override toString() {
    return `ServerBoundHeartbeatPacket{}`;
  }

  static encode(number: bigint): Buffer {
    const buf = Buffer.alloc(4 + 8);

    buf.writeInt32BE(ServerBoundHeartbeatPacket.type, 0);
    buf.writeBigUInt64BE(number, 4);

    return buf;
  }
}
