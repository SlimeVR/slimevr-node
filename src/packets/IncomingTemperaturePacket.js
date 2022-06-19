import { Packet } from './Packet';

module.exports = class IncomingTemperaturePacket extends Packet {
  /**
   * @param {Buffer} data
   */
  constructor(data) {
    super(IncomingTemperaturePacket.type);

    this.sensorId = data.readUintBE(0, 1) & 0xff;
    this.temperature = data.readFloatBE(1);
  }

  static get type() {
    return 20;
  }

  toString() {
    return `IncomingTemperaturePacket{sensorId: ${this.sensorId}, temperature: ${this.temperature}}`;
  }
};
