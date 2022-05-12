const Packet = require('./Packet');

module.exports = class IncomingBatteryLevelPacket extends Packet {
  /**
   * @param {Buffer} data
   */
  constructor(data) {
    super(IncomingBatteryLevelPacket.type);

    this.voltage = 0;

    const tmp = data.readFloatBE(0);
    data = data.slice(4);

    if (data.length >= 4) {
      this.percentage = data.readFloatBE(4) * 100;
      this.voltage = tmp;
    } else {
      this.percentage = tmp;
    }
  }

  static get type() {
    return 12;
  }

  toString() {
    return `IncomingBatteryLevelPacket{voltage: ${this.voltage}, percentage: ${this.percentage}}`;
  }
};
