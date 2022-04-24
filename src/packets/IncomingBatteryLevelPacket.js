const Packet = require('./Packet');

module.exports = class IncomingBatteryLevelPacket extends Packet {
  /**
   * @param {Buffer} data
   */
  constructor(data) {
    super(IncomingBatteryLevelPacket.type);

    this.voltage = data.readFloatBE(0);
    this.percentage = data.readFloatBE(4) * 100;
  }

  static get type() {
    return 12;
  }

  toString() {
    return `IncomingBatteryLevelPacket{voltage: ${this.voltage}, percentage: ${this.percentage}}`;
  }
};
