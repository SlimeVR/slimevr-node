import { FirmwareFeatureFlags } from '../FeatureFlags';
import { Packet } from './Packet';

export class ServerBoundFeatureFlagsPacket extends Packet {
  readonly flags: FirmwareFeatureFlags;

  constructor(number: bigint, data: Buffer) {
    super(number, ServerBoundFeatureFlagsPacket.type);

    this.flags = FirmwareFeatureFlags.unpack(data);
  }

  static get type() {
    return 22;
  }

  override toString() {
    return `ServerBoundFeatureFlagsPacket{flags: ${this.flags.getAllEnabled().join(',')}}`;
  }
}
