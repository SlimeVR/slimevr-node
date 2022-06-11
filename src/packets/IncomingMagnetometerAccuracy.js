const Packet = require('./Packet');

module.exports = class IncomingMagnetometerAccuracyPacket extends Packet {
  /**
   * @param {Buffer} data
   */
  constructor(data) {
    super(IncomingMagnetometerAccuracyPacket.type);

    this.sensorId = data.readUintBE(0, 1) & 0xff;
    this.accuracy = data.readFloatBE(1);
  }

  static get type() {
    return 18;
  }

  toString() {
    return `IncomingMagnetometerAccuracyPacket{sensorId: ${this.sensorId}, accuracy: ${this.accuracy}}`;
  }
};
