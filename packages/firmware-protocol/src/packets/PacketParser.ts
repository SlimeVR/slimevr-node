import { IncomingAccelPacket } from './IncomingAccelPacket';
import { IncomingBatteryLevelPacket } from './IncomingBatteryLevelPacket';
import { IncomingCalibrationFinishedPacket } from './IncomingCalibrationFinishedPacket';
import { IncomingErrorPacket } from './IncomingErrorPacket';
import { IncomingGyroPacket } from './IncomingGyroPacket';
import { IncomingHandshakePacket } from './IncomingHandshakePacket';
import { IncomingHeartbeatPacket } from './IncomingHeartbeatPacket';
import { IncomingMagnetometerAccuracyPacket } from './IncomingMagnetometerAccuracy';
import { IncomingPongPacket } from './IncomingPongPacket';
import { IncomingRawCalibrationDataPacket } from './IncomingRawCalibrationDataPacket';
import { IncomingRotationDataPacket } from './IncomingRotationDataPacket';
import { IncomingRotationPacket } from './IncomingRotationPacket';
import { IncomingSensorInfoPacket } from './IncomingSensorInfoPacket';
import { IncomingSignalStrengthPacket } from './IncomingSignalStrengthPacket';
import { IncomingTapPacket } from './IncomingTapPacket';
import { IncomingTemperaturePacket } from './IncomingTemperaturePacket';
import { InspectionPacketParser } from './inspection/PacketParser';

export const parse = (data: Buffer) => {
  const type = data.readInt32BE();
  const number = data.readBigInt64BE(4);

  data = data.slice(12);

  switch (type) {
    case IncomingHeartbeatPacket.type:
      return new IncomingHeartbeatPacket(number);

    case IncomingRotationPacket.type:
      return new IncomingRotationPacket(number, data);

    case IncomingGyroPacket.type:
      return new IncomingGyroPacket(number, data);

    case IncomingHandshakePacket.type:
      return new IncomingHandshakePacket(number, data);

    case IncomingAccelPacket.type:
      return new IncomingAccelPacket(number, data);

    case IncomingRawCalibrationDataPacket.type:
      return new IncomingRawCalibrationDataPacket(number, data);

    case IncomingCalibrationFinishedPacket.type:
      return new IncomingCalibrationFinishedPacket(number, data);

    case IncomingPongPacket.type:
      return new IncomingPongPacket(number, data);

    case IncomingBatteryLevelPacket.type:
      return new IncomingBatteryLevelPacket(number, data);

    case IncomingTapPacket.type:
      return new IncomingTapPacket(number, data);

    case IncomingErrorPacket.type:
      return new IncomingErrorPacket(number, data);

    case IncomingSensorInfoPacket.type:
      return new IncomingSensorInfoPacket(number, data);

    case IncomingRotationDataPacket.type:
      return new IncomingRotationDataPacket(number, data);

    case IncomingMagnetometerAccuracyPacket.type:
      return new IncomingMagnetometerAccuracyPacket(number, data);

    case IncomingSignalStrengthPacket.type:
      return new IncomingSignalStrengthPacket(number, data);

    case IncomingTemperaturePacket.type:
      return new IncomingTemperaturePacket(number, data);

    case InspectionPacketParser.type:
      return InspectionPacketParser.parseRawDataPacket(number, data);

    default:
      console.log(`Unknown packet type: ${type}`);
      return null;
  }
};
