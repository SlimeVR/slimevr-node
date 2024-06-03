import { Packet } from './Packet';

export const UserAction = {
  RESET_FULL: 2,
  RESET_YAW: 3,
  RESET_MOUNTING: 4,
  PAUSE_TRACKING: 5
} as const;
export type UserAction = (typeof UserAction)[keyof typeof UserAction];

export class ServerBoundUserActionPacket extends Packet {
  constructor(readonly action: number) {
    super(ServerBoundUserActionPacket.type);
  }

  static fromBuffer(data: Buffer) {
    const action = data.readUIntBE(0, 1) & (0xff as UserAction);

    return new ServerBoundUserActionPacket(action);
  }

  static get type() {
    return 21;
  }

  override toString() {
    return `ServerBoundUserActionPacket{action: ${this.action}}`;
  }

  encode(num: bigint): Buffer {
    const buf = Buffer.alloc(4 + 8 + 1);

    buf.writeInt32BE(ServerBoundUserActionPacket.type, 0);
    buf.writeBigInt64BE(num, 4);

    buf.writeInt8(this.action, 12);

    return buf;
  }
}
