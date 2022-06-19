import { Packet } from './Packet';

module.exports = class IncomingHeartbeatPacket extends Packet {
  constructor() {
    super(IncomingHeartbeatPacket.type);
  }

  static get type() {
    return 0;
  }

  toString() {
    return 'IncomingHeartbeatPacket{}';
  }
};
