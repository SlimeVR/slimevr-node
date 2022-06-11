const Packet = require('./Packet');

module.exports = class IncomingSignalStrengthPacket extends Packet {
  /**
   * @param {Buffer} data
   */
  constructor(data) {
    super(IncomingSignalStrengthPacket.type);

    this.sensorId = data.readUintBE(0, 1) & 0xff;
    this.signalStrength = data.readUintBE(1, 1);
  }

  static get type() {
    return 19;
  }

  toString() {
    return `IncomingSignalStrengthPacket{sensorId: ${this.sensorId}, signalStrength: ${this.signalStrength}}`;
  }
};
