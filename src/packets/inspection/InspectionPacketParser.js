import { IncomingCorrectionDataPacket } from './IncomingCorrectionDataPacket';
import { PacketType } from './constants';

const IncomingFusedIMUDataPacket = require('./IncomingFusedIMUDataPacket');
const IncomingRawIMUDataPacket = require('./IncomingRawIMUDataPacket');

module.exports = class InspectionPacketParser {
  /**
   * @param {Buffer} data
   */
  static parseRawDataPacket = (data) => {
    const packetType = data.readUInt8(0);

    data = data.slice(1);

    switch (packetType) {
      case PacketType.RAW:
        return new IncomingRawIMUDataPacket(data);

      case PacketType.FUSED:
        return new IncomingFusedIMUDataPacket(data);

      case PacketType.CORRECTION:
        return new IncomingCorrectionDataPacket(data);

      default:
      // console.log(`Unknown packet type: ${PacketType}`);
    }

    return null;
  };

  static get type() {
    return 0x69;
  }
};
