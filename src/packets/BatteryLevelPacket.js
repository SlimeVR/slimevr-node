const Packet = require('./Packet');

module.exports = class BatteryLevelPacket extends Packet {
  /**
   * @param {Buffer} data
   */
  constructor(data) {
    super(BatteryLevelPacket.type);

    this.voltage = data.readFloatBE(0);
    this.percentage = data.readFloatBE(4) * 100;
  }

  static get type() {
    return 12;
  }

  toString() {
    return `BatteryLevelPacket{voltage: ${this.voltage}, percentage: ${this.percentage}}`;
  }
};
