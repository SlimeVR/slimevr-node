import { Tracker } from '../Tracker';

const IncomingAccelPacket = require('./IncomingAccelPacket');
const IncomingBatteryLevelPacket = require('./IncomingBatteryLevelPacket');
const IncomingErrorPacket = require('./IncomingErrorPacket');
const IncomingHandshakePacket = require('./IncomingHandshakePacket');
const IncomingHeartbeatPacket = require('./IncomingHeartbeatPacket');
const IncomingPongPacket = require('./IncomingPongPacket');
const IncomingRawCalibrationDataPacket = require('./IncomingRawCalibrationDataPacket');
const IncomingRotationDataPacket = require('./IncomingRotationDataPacket');
const IncomingSensorInfoPacket = require('./IncomingSensorInfoPacket');
const IncomingSignalStrengthPacket = require('./IncomingSignalStrengthPacket');
const InspectionPacketParser = require('./inspection/InspectionPacketParser');
const IncomingCalibrationFinishedPacket = require('./IncomingCalibrationFinishedPacket');
const IncomingTemperaturePacket = require('./IncomingTemperaturePacket');
const IncomingMagnetometerAccuracyPacket = require('./IncomingMagnetometerAccuracy');
const IncomingTapPacket = require('./IncomingTapPacket');
const IncomingRotationPacket = require('./IncomingRotationPacket');
const IncomingGyroPacket = require('./IncomingGyroPacket');

export const parse = (data: Buffer, tracker: Tracker) => {
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

    case IncomingRotationPacket.type:
      return new IncomingRotationPacket(data);

    case IncomingGyroPacket.type:
      return new IncomingGyroPacket(data);

    case IncomingHandshakePacket.type:
      return new IncomingHandshakePacket(data);

    case IncomingAccelPacket.type:
      return new IncomingAccelPacket(data);

    case IncomingRawCalibrationDataPacket.type:
      return new IncomingRawCalibrationDataPacket(data);

    case IncomingCalibrationFinishedPacket.type:
      return new IncomingCalibrationFinishedPacket(data);

    case IncomingPongPacket.type:
      return new IncomingPongPacket(data);

    case IncomingBatteryLevelPacket.type:
      return new IncomingBatteryLevelPacket(data);

    case IncomingTapPacket.type:
      return new IncomingTapPacket(data);

    case IncomingErrorPacket.type:
      return new IncomingErrorPacket(data);

    case IncomingSensorInfoPacket.type:
      return new IncomingSensorInfoPacket(data);

    case IncomingRotationDataPacket.type:
      return new IncomingRotationDataPacket(data);

    case IncomingMagnetometerAccuracyPacket.type:
      return new IncomingMagnetometerAccuracyPacket(data);

    case IncomingSignalStrengthPacket.type:
      return new IncomingSignalStrengthPacket(data);

    case IncomingTemperaturePacket.type:
      return new IncomingTemperaturePacket(data);

    case InspectionPacketParser.type:
      return InspectionPacketParser.parseRawDataPacket(data);

    default:
      console.log(`Unknown packet type: ${type}`);
  }

  return null;
};
