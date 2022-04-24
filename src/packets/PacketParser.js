const IncomingBatteryLevelPacket = require('./IncomingBatteryLevelPacket');
const IncomingErrorPacket = require('./IncomingErrorPacket');
const IncomingHandshakePacket = require('./IncomingHandshakePacket');
const IncomingHeartbeatPacket = require('./IncomingHeartbeatPacket');
const IncomingPongPacket = require('./IncomingPongPacket');
const IncomingRotationDataPacket = require('./IncomingRotationDataPacket');
const IncomingSensorInfoPacket = require('./IncomingSensorInfoPacket');
const IncomingSignalStrengthPacket = require('./IncomingSignalStrengthPacket');
const InspectionPacketParser = require('./inspection/InspectionPacketParser');

module.exports = class PacketParser {
  /**
   * @param {Buffer} data
   * @param {import('../Tracker')} tracker
   */
  static parse(data, tracker) {
    const type = data.readInt32BE();
    const number = data.readBigInt64BE(4);

    if (!tracker.isNextPacket(number)) {
      console.log(`Invalid sequence: ${tracker.ip}:${tracker.port} - ${tracker.packetNumber} ${number}`);
      return null;
    }

    data = data.slice(12);

    switch (type) {
      case IncomingHeartbeatPacket.type:
        return new IncomingHeartbeatPacket();

      case IncomingHandshakePacket.type:
        return new IncomingHandshakePacket(data);

      case IncomingSensorInfoPacket.type:
        return new IncomingSensorInfoPacket(data);

      case IncomingRotationDataPacket.type:
        return new IncomingRotationDataPacket(data);

      case IncomingSignalStrengthPacket.type:
        return new IncomingSignalStrengthPacket(data);

      case IncomingPongPacket.type:
        return new IncomingPongPacket(data);

      case IncomingBatteryLevelPacket.type:
        return new IncomingBatteryLevelPacket(data);

      case IncomingErrorPacket.type:
        return new IncomingErrorPacket(data);

      case InspectionPacketParser.type:
        return InspectionPacketParser.parseRawDataPacket(data);

      default:
      // console.log(`Unknown packet type: ${type}`);
    }

    return null;
  }
};
