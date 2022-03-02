const Packet = require('./Packet');

module.exports = class SignalStrengthPacket extends Packet {
  /**
   * @param {Buffer} data
   */
  constructor(data) {
    super(SignalStrengthPacket.type);

    this.sensorId = data.readUintBE(0, 1) & 0xff;
    this.signalStrength = data.readUintBE(1, 1);
  }

  static get type() {
    return 19;
  }

  toString() {
    return `SignalStrengthPacket{sensorId: ${this.sensorId}, signalStrength: ${this.signalStrength}}`;
  }
};
