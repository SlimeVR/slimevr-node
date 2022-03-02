const Packet = require('./Packet');

module.exports = class PongPacket extends Packet {
  /**
   * @param {Buffer} data
   */
  constructor(data) {
    super(PongPacket.type);

    this.pingId = data.readInt32BE(0);
  }

  static get type() {
    return 10;
  }

  toString() {
    return `PongPacket{pingId: ${this.pingId}}`;
  }
};
