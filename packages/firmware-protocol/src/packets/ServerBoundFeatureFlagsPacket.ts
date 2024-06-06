import { FirmwareFeatureFlags } from '../FeatureFlags.js';
import { Packet } from './Packet.js';

export class ServerBoundFeatureFlagsPacket extends Packet {
  constructor(readonly flags: FirmwareFeatureFlags) {
    super(ServerBoundFeatureFlagsPacket.type);
  }

  static fromBuffer(data: Buffer) {
    const flags = FirmwareFeatureFlags.unpack(data);

    return new ServerBoundFeatureFlagsPacket(flags);
  }

  static get type() {
    return 22;
  }

  override toString() {
    return `ServerBoundFeatureFlagsPacket{flags: ${this.flags.getAllEnabled().join(',')}}`;
  }

  encode(num: bigint): Buffer {
    const buf = Buffer.alloc(4 + 8);

    buf.writeInt32BE(ServerBoundFeatureFlagsPacket.type, 0);
    buf.writeBigUInt64BE(num, 4);

    return Buffer.concat([buf, this.flags.pack()]);
  }
}
