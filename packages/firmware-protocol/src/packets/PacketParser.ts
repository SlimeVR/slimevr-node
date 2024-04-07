import { DeviceBoundFeatureFlagsPacket } from './DeviceBoundFeatureFlagsPacket';
import { DeviceBoundHandshakePacket } from './DeviceBoundHandshakePacket';
import { DeviceBoundHeartbeatPacket } from './DeviceBoundHeartbeatPacket';
import { DeviceBoundPingPacket } from './DeviceBoundPingPacket';
import { DeviceBoundSensorInfoPacket } from './DeviceBoundSensorInfoPacket';
import { ServerBoundAccelPacket } from './ServerBoundAccelPacket';
import { ServerBoundBatteryLevelPacket } from './ServerBoundBatteryLevelPacket';
import { ServerBoundBundlePacket } from './ServerBoundBundlePacket';
import { ServerBoundCalibrationFinishedPacket } from './ServerBoundCalibrationFinishedPacket';
import { ServerBoundErrorPacket } from './ServerBoundErrorPacket';
import { ServerBoundFeatureFlagsPacket } from './ServerBoundFeatureFlagsPacket';
import { ServerBoundGyroPacket } from './ServerBoundGyroPacket';
import { ServerBoundHandshakePacket } from './ServerBoundHandshakePacket';
import { ServerBoundHeartbeatPacket } from './ServerBoundHeartbeatPacket';
import { ServerBoundMagnetometerAccuracyPacket } from './ServerBoundMagnetometerAccuracy';
import { ServerBoundPongPacket } from './ServerBoundPongPacket';
import { ServerBoundRawCalibrationDataPacket } from './ServerBoundRawCalibrationDataPacket';
import { ServerBoundRotationDataPacket } from './ServerBoundRotationDataPacket';
import { ServerBoundRotationPacket } from './ServerBoundRotationPacket';
import { ServerBoundSensorInfoPacket } from './ServerBoundSensorInfoPacket';
import { ServerBoundSignalStrengthPacket } from './ServerBoundSignalStrengthPacket';
import { ServerBoundTapPacket } from './ServerBoundTapPacket';
import { ServerBoundTemperaturePacket } from './ServerBoundTemperaturePacket';
import { InspectionPacketParser } from './inspection/PacketParser';

export const parse = (data: Buffer, isDeviceBound: boolean, isInBundle = false) => {
  if (isDeviceBound) {
    if (data.readUint8(0) === DeviceBoundHandshakePacket.type) {
      return new DeviceBoundHandshakePacket(0n);
    }

    const type = data.readUInt32BE();

    if (type === DeviceBoundSensorInfoPacket.type) {
      return new DeviceBoundSensorInfoPacket(0n, data);
    }

    const number = data.readBigInt64BE(4);

    data = data.slice(12);

    switch (type) {
      case DeviceBoundHeartbeatPacket.type:
        return new DeviceBoundHeartbeatPacket(number);

      case DeviceBoundPingPacket.type:
        return new DeviceBoundPingPacket(number, data);

      case DeviceBoundFeatureFlagsPacket.type:
        return new DeviceBoundFeatureFlagsPacket(number, data);

      default:
        console.log(data.toString('hex'));
        console.log(`Unknown packet type: ${type}`);
        return null;
    }
  } else {
    const type = data.readUInt32BE();
    const number = isInBundle ? BigInt(0) : data.readBigInt64BE(4);

    data = data.slice(isInBundle ? 4 : 12);

    switch (type) {
      case ServerBoundHeartbeatPacket.type:
        return new ServerBoundHeartbeatPacket(number);

      case ServerBoundRotationPacket.type:
        return new ServerBoundRotationPacket(number, data);

      case ServerBoundGyroPacket.type:
        return new ServerBoundGyroPacket(number, data);

      case ServerBoundHandshakePacket.type:
        return new ServerBoundHandshakePacket(number, data);

      case ServerBoundAccelPacket.type:
        return new ServerBoundAccelPacket(number, data);

      case ServerBoundRawCalibrationDataPacket.type:
        return new ServerBoundRawCalibrationDataPacket(number, data);

      case ServerBoundCalibrationFinishedPacket.type:
        return new ServerBoundCalibrationFinishedPacket(number, data);

      case ServerBoundPongPacket.type:
        return new ServerBoundPongPacket(number, data);

      case ServerBoundBatteryLevelPacket.type:
        return new ServerBoundBatteryLevelPacket(number, data);

      case ServerBoundTapPacket.type:
        return new ServerBoundTapPacket(number, data);

      case ServerBoundErrorPacket.type:
        return new ServerBoundErrorPacket(number, data);

      case ServerBoundSensorInfoPacket.type:
        return new ServerBoundSensorInfoPacket(number, data);

      case ServerBoundRotationDataPacket.type:
        return new ServerBoundRotationDataPacket(number, data);

      case ServerBoundFeatureFlagsPacket.type:
        return new ServerBoundFeatureFlagsPacket(number, data);

      case ServerBoundBundlePacket.type:
        return new ServerBoundBundlePacket(number, data);

      case ServerBoundMagnetometerAccuracyPacket.type:
        return new ServerBoundMagnetometerAccuracyPacket(number, data);

      case ServerBoundSignalStrengthPacket.type:
        return new ServerBoundSignalStrengthPacket(number, data);

      case ServerBoundTemperaturePacket.type:
        return new ServerBoundTemperaturePacket(number, data);

      case InspectionPacketParser.type:
        return InspectionPacketParser.parseRawDataPacket(number, data);

      default:
        console.log(`Unknown packet type: ${type}`);
        return null;
    }
  }
};
