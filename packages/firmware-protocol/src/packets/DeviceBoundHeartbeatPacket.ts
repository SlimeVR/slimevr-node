import { Packet } from './Packet.js';

export class DeviceBoundHeartbeatPacket extends Packet {
  constructor() {
    super(DeviceBoundHeartbeatPacket.type);
  }

  static get type() {
    return 1;
  }

  override toString() {
    return 'DeviceBoundHeartbeatPacket{}';
  }

  encode(num: bigint) {
    const buf = Buffer.alloc(4 + 8);

    buf.writeInt32BE(this.type);
    buf.writeBigInt64BE(num, 4);

    return buf;
  }
}
