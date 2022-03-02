const BatteryLevelPacket = require('./BatteryLevelPacket');
const ErrorPacket = require('./ErrorPacket');
const HandshakePacket = require('./HandshakePacket');
const HeartbeatPacket = require('./HeartbeatPacket');
const InspectionPacketParser = require('./inspection/InspectionPacketParser');
const PongPacket = require('./PongPacket');
const RotationDataPacket = require('./RotationDataPacket');
const SensorInfoPacket = require('./SensorInfoPacket');
const SignalStrengthPacket = require('./SignalStrengthPacket');

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
      case HeartbeatPacket.type:
        return new HeartbeatPacket();

      case HandshakePacket.type:
        return new HandshakePacket(data);

      case SensorInfoPacket.type:
        return new SensorInfoPacket(data);

      case RotationDataPacket.type:
        return new RotationDataPacket(data);

      case SignalStrengthPacket.type:
        return new SignalStrengthPacket(data);

      case PongPacket.type:
        return new PongPacket(data);

      case BatteryLevelPacket.type:
        return new BatteryLevelPacket(data);

      case ErrorPacket.type:
        return new ErrorPacket(data);

      case InspectionPacketParser.type:
        return InspectionPacketParser.parseRawDataPacket(data);

      default:
      // console.log(`Unknown packet type: ${type}`);
    }

    return null;
  }
};
