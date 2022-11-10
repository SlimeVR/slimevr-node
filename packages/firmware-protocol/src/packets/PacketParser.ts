import { IncomingCalibrationFinishedPacket } from './IncomingCalibrationFinishedPacket';
import { IncomingErrorPacket } from './IncomingErrorPacket';
import { IncomingGyroPacket } from './IncomingGyroPacket';
import { IncomingHeartbeatPacket } from './IncomingHeartbeatPacket';
import { IncomingMagnetometerAccuracyPacket } from './IncomingMagnetometerAccuracy';
import { IncomingRawCalibrationDataPacket } from './IncomingRawCalibrationDataPacket';
import { IncomingRotationPacket } from './IncomingRotationPacket';
import { IncomingSignalStrengthPacket } from './IncomingSignalStrengthPacket';
import { IncomingTapPacket } from './IncomingTapPacket';
import { IncomingTemperaturePacket } from './IncomingTemperaturePacket';
import { InspectionPacketParser } from './inspection/PacketParser';
import { ServerBoundAccelPacket } from './ServerBoundAccelPacket';
import { ServerBoundBatteryLevelPacket } from './ServerBoundBatteryLevelPacket';
import { ServerBoundHandshakePacket } from './ServerBoundHandshakePacket';
import { ServerBoundPongPacket } from './ServerBoundPongPacket';
import { ServerBoundRotationDataPacket } from './ServerBoundRotationDataPacket';
import { ServerBoundSensorInfoPacket } from './ServerBoundSensorInfoPacket';

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

    case ServerBoundHandshakePacket.type:
      return new ServerBoundHandshakePacket(number, data);

    case ServerBoundAccelPacket.type:
      return new ServerBoundAccelPacket(number, data);

    case IncomingRawCalibrationDataPacket.type:
      return new IncomingRawCalibrationDataPacket(number, data);

    case IncomingCalibrationFinishedPacket.type:
      return new IncomingCalibrationFinishedPacket(number, data);

    case ServerBoundPongPacket.type:
      return new ServerBoundPongPacket(number, data);

    case ServerBoundBatteryLevelPacket.type:
      return new ServerBoundBatteryLevelPacket(number, data);

    case IncomingTapPacket.type:
      return new IncomingTapPacket(number, data);

    case IncomingErrorPacket.type:
      return new IncomingErrorPacket(number, data);

    case ServerBoundSensorInfoPacket.type:
      return new ServerBoundSensorInfoPacket(number, data);

    case ServerBoundRotationDataPacket.type:
      return new ServerBoundRotationDataPacket(number, data);

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
