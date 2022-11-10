import { Packet } from './Packet';

export class IncomingHeartbeatPacket extends Packet {
  constructor(number: bigint) {
    super(number, IncomingHeartbeatPacket.type);
  }

  static get type() {
    return 0;
  }

  override toString() {
    return 'IncomingHeartbeatPacket{}';
  }
}
