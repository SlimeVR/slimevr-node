import { ServerFeatureFlags } from '../FeatureFlags';
import { Packet } from './Packet';

export class DeviceBoundFeatureFlagsPacket extends Packet {
  readonly flags: ServerFeatureFlags;

  constructor(number: bigint, data: Buffer) {
    super(number, DeviceBoundFeatureFlagsPacket.type);

    this.flags = ServerFeatureFlags.unpack(data);
  }

  static get type() {
    return 22;
  }

  override toString() {
    return `DeviceBoundFeatureFlagsPacket{flags: ${this.flags.getAllEnabled().join(',')}}`;
  }

  static encode(number: bigint, flags: ServerFeatureFlags) {
    const packed = flags.pack();
    const buf = Buffer.alloc(4 + 8);

    buf.writeInt32BE(DeviceBoundFeatureFlagsPacket.type, 0);
    buf.writeBigInt64BE(number, 4);

    return Buffer.concat([buf, packed]);
  }
}
