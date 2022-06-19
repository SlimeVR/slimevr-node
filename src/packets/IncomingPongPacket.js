import { Packet } from './Packet';

module.exports = class IncomingPongPacket extends Packet {
  /**
   * @param {Buffer} data
   */
  constructor(data) {
    super(IncomingPongPacket.type);

    this.pingId = data.readInt32BE(0);
  }

  static get type() {
    return 10;
  }

  toString() {
    return `IncomingPongPacket{pingId: ${this.pingId}}`;
  }
};
