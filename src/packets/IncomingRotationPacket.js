import { Packet } from './Packet';

module.exports = class IncomingRotationPacket extends Packet {
  /**
   * @param {Buffer} data
   */
  constructor(data) {
    super(IncomingRotationPacket.type);

    this.rotation = [data.readFloatBE(0), data.readFloatBE(4), data.readFloatBE(8), data.readFloatBE(12)];
  }

  static get type() {
    return 1;
  }

  toString() {
    return `IncomingRotationPacket{rotation: ${this.rotation}}`;
  }
};
