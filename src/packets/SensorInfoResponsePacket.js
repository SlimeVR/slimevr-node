const Packet = require('./Packet');

module.exports = class SensorInfoResponsePacket extends Packet {
  /**
   * @param {number} sensorId
   * @param {number} sensorStatus
   */
  constructor(sensorId, sensorStatus) {
    super(SensorInfoResponsePacket.type);

    this.sensorId = sensorId;
    this.sensorStatus = sensorStatus;
  }

  static get type() {
    return 15;
  }

  toString() {
    return `SensorInfoResposePacket{sensorId: ${this.sensorId}, sensorStatus: ${this.sensorStatus}}`;
  }

  encode() {
    const buffer = Buffer.alloc(6);
    buffer.writeInt32BE(SensorInfoResponsePacket.type, 0);
    buffer.writeUInt8(this.sensorId, 4);
    buffer.writeUInt8(this.sensorStatus, 5);
    return buffer;
  }
};
