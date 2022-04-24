const Packet = require('./Packet');

module.exports = class IncomingSensorInfoPacket extends Packet {
  /**
   * @param {Buffer} data
   */
  constructor(data) {
    super(IncomingSensorInfoPacket.type);

    this.sensorId = data.readUintBE(0, 1) & 0xff;
    this.sensorStatus = data.readUintBE(1, 1) & 0xff;

    this.sensorType = -1;

    if (data.length >= 3) {
      this.sensorType = data.readUintBE(2, 1) & 0xff;
    }
  }

  static get type() {
    return 15;
  }

  toString() {
    return `IncomingSensorInfoPacket{sensorId: ${this.sensorId}, sensorStatus: ${this.sensorStatus}, sensorType: ${this.sensorType}}`;
  }
};
