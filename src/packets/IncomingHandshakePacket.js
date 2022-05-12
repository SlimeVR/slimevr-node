const { formatMACAddressDigit } = require('../utils');
const Packet = require('./Packet');

module.exports = class IncomingHandshakePacket extends Packet {
  /**
   * @param {Buffer} data
   */
  constructor(data) {
    super(IncomingHandshakePacket.type);

    this.boardType = -1;
    this.imuType = -1;
    this.mcuType = -1;
    this.firmwareBuild = -1;
    this.firmware = '';
    this.mac = '';

    if (data.length === 0) {
      return;
    }

    if (data.length >= 4) {
      this.boardType = data.readInt32BE();
      data = data.slice(4);
    }

    if (data.length >= 4) {
      this.imuType = data.readInt32BE();
      data = data.slice(4);
    }

    if (data.length >= 4) {
      this.mcuType = data.readInt32BE();
      data = data.slice(4);
    }

    if (data.length >= 12) {
      // Skip IMU imu
      data = data.slice(12);
    }

    if (data.length >= 4) {
      this.firmwareBuild = data.readInt32BE();
      data = data.slice(4);
    }

    let length = 0;
    if (data.length >= 4) {
      length = data.readUintBE(0, 1);
      data = data.slice(1);
    }

    this.firmware = this.readAscii(data, length);
    data = data.slice(length);

    if (data.length >= 6) {
      this.mac = [data.readUint8(0), data.readUint8(1), data.readUint8(2), data.readUint8(3), data.readUint8(4), data.readUint8(5)]
        .map(formatMACAddressDigit)
        .join(':');
    }
  }

  static get type() {
    return 3;
  }

  readAscii(data, length) {
    let buf = '';

    while (length-- > 0) {
      const v = data.readUIntBE(0, 1) & 0xff;

      if (v === 0) {
        break;
      }

      buf += String.fromCharCode(v);

      data = data.slice(1);
    }

    return buf;
  }

  toString() {
    return `IncomingHandshakePacket{boardType: ${this.boardType}, imuType: ${this.imuType}, mcuType: ${this.mcuType}, firmwareBuild: ${this.firmwareBuild}, firmware: ${this.firmware}, mac: ${this.mac}}`;
  }
};
