import { DeviceBoundFeatureFlagsPacket } from './DeviceBoundFeatureFlagsPacket.js';
import { DeviceBoundHandshakePacket } from './DeviceBoundHandshakePacket.js';
import { DeviceBoundHeartbeatPacket } from './DeviceBoundHeartbeatPacket.js';
import { DeviceBoundPingPacket } from './DeviceBoundPingPacket.js';
import { DeviceBoundSensorInfoPacket } from './DeviceBoundSensorInfoPacket.js';
import { Packet } from './Packet.js';
import { ServerBoundAccelPacket } from './ServerBoundAccelPacket.js';
import { ServerBoundBatteryLevelPacket } from './ServerBoundBatteryLevelPacket.js';
import { ServerBoundBundlePacket } from './ServerBoundBundlePacket.js';
import { ServerBoundCalibrationFinishedPacket } from './ServerBoundCalibrationFinishedPacket.js';
import { ServerBoundErrorPacket } from './ServerBoundErrorPacket.js';
import { ServerBoundFeatureFlagsPacket } from './ServerBoundFeatureFlagsPacket.js';
import { ServerBoundGyroPacket } from './ServerBoundGyroPacket.js';
import { ServerBoundHandshakePacket } from './ServerBoundHandshakePacket.js';
import { ServerBoundHeartbeatPacket } from './ServerBoundHeartbeatPacket.js';
import { ServerBoundMagnetometerAccuracyPacket } from './ServerBoundMagnetometerAccuracy.js';
import { ServerBoundPongPacket } from './ServerBoundPongPacket.js';
import { ServerBoundRawCalibrationDataPacket } from './ServerBoundRawCalibrationDataPacket.js';
import { ServerBoundRotationDataPacket } from './ServerBoundRotationDataPacket.js';
import { ServerBoundRotationPacket } from './ServerBoundRotationPacket.js';
import { ServerBoundSensorInfoPacket } from './ServerBoundSensorInfoPacket.js';
import { ServerBoundSignalStrengthPacket } from './ServerBoundSignalStrengthPacket.js';
import { ServerBoundTapPacket } from './ServerBoundTapPacket.js';
import { ServerBoundTemperaturePacket } from './ServerBoundTemperaturePacket.js';
import { ServerBoundUserActionPacket } from './ServerBoundUserActionPacket.js';
import { InspectionPacketParser } from './inspection/PacketParser.js';

const bundle = (num: bigint, packet: Packet | null) => [num, packet] as const;

export const parse = (data: Buffer, isDeviceBound: boolean, isInBundle = false) => {
  if (isDeviceBound) {
    if (data.readUint8(0) === DeviceBoundHandshakePacket.type) {
      return bundle(0n, new DeviceBoundHandshakePacket());
    }

    const type = data.readUInt32BE();

    if (type === DeviceBoundSensorInfoPacket.type) {
      return bundle(0n, DeviceBoundSensorInfoPacket.fromBuffer(data));
    }

    const num = data.readBigInt64BE(4);

    data = data.slice(12);

    switch (type) {
      case DeviceBoundHeartbeatPacket.type:
        return bundle(num, new DeviceBoundHeartbeatPacket());

      case DeviceBoundPingPacket.type:
        return bundle(num, DeviceBoundPingPacket.fromBuffer(data));

      case DeviceBoundFeatureFlagsPacket.type:
        return bundle(num, DeviceBoundFeatureFlagsPacket.fromBuffer(data));

      default:
        console.log(data.toString('hex'));
        console.log(`Unknown packet type: ${type}`);
        return bundle(num, null);
    }
  } else {
    const type = data.readUInt32BE();
    const num = isInBundle ? BigInt(0) : data.readBigInt64BE(4);

    data = data.slice(isInBundle ? 4 : 12);

    switch (type) {
      case ServerBoundHeartbeatPacket.type:
        return bundle(num, new ServerBoundHeartbeatPacket());

      case ServerBoundRotationPacket.type:
        return bundle(num, ServerBoundRotationPacket.fromBuffer(data));

      case ServerBoundGyroPacket.type:
        return bundle(num, ServerBoundGyroPacket.fromBuffer(data));

      case ServerBoundHandshakePacket.type:
        return bundle(num, ServerBoundHandshakePacket.fromBuffer(data));

      case ServerBoundAccelPacket.type:
        return bundle(num, ServerBoundAccelPacket.fromBuffer(data));

      case ServerBoundRawCalibrationDataPacket.type:
        return bundle(num, ServerBoundRawCalibrationDataPacket.fromBuffer(data));

      case ServerBoundCalibrationFinishedPacket.type:
        return bundle(num, ServerBoundCalibrationFinishedPacket.fromBuffer(data));

      case ServerBoundPongPacket.type:
        return bundle(num, ServerBoundPongPacket.fromBuffer(data));

      case ServerBoundBatteryLevelPacket.type:
        return bundle(num, ServerBoundBatteryLevelPacket.fromBuffer(data));

      case ServerBoundTapPacket.type:
        return bundle(num, ServerBoundTapPacket.fromBuffer(data));

      case ServerBoundErrorPacket.type:
        return bundle(num, ServerBoundErrorPacket.fromBuffer(data));

      case ServerBoundSensorInfoPacket.type:
        return bundle(num, ServerBoundSensorInfoPacket.fromBuffer(data));

      case ServerBoundRotationDataPacket.type:
        return bundle(num, ServerBoundRotationDataPacket.fromBuffer(data));

      case ServerBoundFeatureFlagsPacket.type:
        return bundle(num, ServerBoundFeatureFlagsPacket.fromBuffer(data));

      case ServerBoundBundlePacket.type:
        return bundle(num, ServerBoundBundlePacket.fromBuffer(data));

      case ServerBoundMagnetometerAccuracyPacket.type:
        return bundle(num, ServerBoundMagnetometerAccuracyPacket.fromBuffer(data));

      case ServerBoundSignalStrengthPacket.type:
        return bundle(num, ServerBoundSignalStrengthPacket.fromBuffer(data));

      case ServerBoundTemperaturePacket.type:
        return bundle(num, ServerBoundTemperaturePacket.fromBuffer(data));

      case ServerBoundUserActionPacket.type:
        return bundle(num, ServerBoundUserActionPacket.fromBuffer(data));

      case InspectionPacketParser.type:
        return bundle(num, InspectionPacketParser.parseRawDataPacket(data));

      default:
        console.log(`Unknown packet type: ${type}`);
        return bundle(num, null);
    }
  }
};
