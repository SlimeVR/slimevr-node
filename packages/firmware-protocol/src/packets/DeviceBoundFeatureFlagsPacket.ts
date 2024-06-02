import { ServerFeatureFlags } from '../FeatureFlags';
import { Packet } from './Packet';

export class DeviceBoundFeatureFlagsPacket extends Packet {
  constructor(readonly flags: ServerFeatureFlags) {
    super(DeviceBoundFeatureFlagsPacket.type);
  }

  static fromBuffer(data: Buffer) {
    const flags = ServerFeatureFlags.unpack(data);

    return new DeviceBoundFeatureFlagsPacket(flags);
  }

  static get type() {
    return 22;
  }

  override toString() {
    return `DeviceBoundFeatureFlagsPacket{flags: ${this.flags.getAllEnabled().join(',')}}`;
  }

  encode(num: bigint) {
    const packed = this.flags.pack();
    const buf = Buffer.alloc(4 + 8);

    buf.writeInt32BE(DeviceBoundFeatureFlagsPacket.type, 0);
    buf.writeBigInt64BE(num, 4);

    return Buffer.concat([buf, packed]);
  }
}
