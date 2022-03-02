const constants = require('./constants');
const FusedIMUDataPacket = require('./FusedIMUDataPacket');
const RawIMUDataPacket = require('./RawIMUDataPacket');

module.exports = class InspectionPacketParser {
  /**
   * @param {Buffer} data
   */
  static parseRawDataPacket = (data) => {
    const packetType = data.readUInt8(0);

    data = data.slice(1);

    switch (packetType) {
      case constants.packetType.raw:
        return new RawIMUDataPacket(data);

      case constants.packetType.fused:
        return new FusedIMUDataPacket(data);

      default:
      // console.log(`Unknown packet type: ${packetType}`);
    }

    return null;
  };

  static get type() {
    return 0x69;
  }
};
