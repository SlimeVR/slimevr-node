import { Quaternion } from '@slimevr/common';
import { SerializedSensor, SerializedTracker } from '@slimevr/firmware-protocol-debugger-shared';
import { networkInterfaces } from 'os';
import { Sensor } from './Sensor';
import { Tracker } from './Tracker';

export const getBroadcastAddresses = (): [string[], string[]] => {
  const broadcasts: string[] = [];
  const blacklist: string[] = [];

  const ifaces = networkInterfaces();
  for (const i of Object.keys(ifaces)) {
    const iface = ifaces[i];

    if (iface === undefined) {
      continue;
    }

    for (const ip of iface) {
      if (ip.family !== 'IPv4' || ip.internal) {
        continue;
      }

      const split = ip.address.split('.');

      split[3] = '255';

      broadcasts.push(split.join('.'));
      blacklist.push(ip.address);
    }
  }

  return [broadcasts, blacklist];
};

export const shouldDumpAllPacketsRaw = () => {
  return process.argv.includes('--dump-all-packets-raw');
};

export const shouldDumpRotationDataPacketsRaw = () => {
  return process.argv.includes('--dump-rotation-data-packets-raw');
};

export const shouldDumpRotationDataPacketsProcessed = () => {
  return process.argv.includes('--dump-rotation-data-packets-processed');
};

export const rotationDataPacketDumpFile = () => {
  const index = process.argv.indexOf('--rotation-data-packets-file');
  if (index === -1) {
    return '';
  }

  return process.argv[index + 1];
};

export const shouldDumpFusedDataRaw = () => {
  return process.argv.includes('--dump-fused-imu-data-raw');
};

export const shouldDumpFusedDataProcessed = () => {
  return process.argv.includes('--dump-fused-imu-data-processed');
};

export const fusedIMUDataDumpFile = () => {
  const index = process.argv.indexOf('--fused-imu-data-file');
  if (index === -1) {
    return '';
  }

  return process.argv[index + 1];
};

export const shouldDumpRawIMUDataRaw = () => {
  return process.argv.includes('--dump-raw-imu-data-raw');
};

export const shouldDumpRawIMUDataProcessed = () => {
  return process.argv.includes('--dump-raw-imu-data-processed');
};

export const rawIMUDataDumpFile = () => {
  const index = process.argv.indexOf('--raw-imu-data-file');
  if (index === -1) {
    return '';
  }

  return process.argv[index + 1];
};

export const shouldDumpCorrectionDataRaw = () => {
  return process.argv.includes('--dump-correction-data-raw');
};

export const shouldDumpCorrectionDataProcessed = () => {
  return process.argv.includes('--dump-correction-data-processed');
};

export const correctionDataDumpFile = () => {
  const index = process.argv.indexOf('--correction-data-file');
  if (index === -1) {
    return '';
  }

  return process.argv[index + 1];
};

export const serializeTracker = (tracker: Tracker): SerializedTracker => {
  const sensors: Record<string, SerializedSensor> = {};

  for (const [index, sensor] of Object.entries(tracker.getSensors())) {
    sensors[index] = serializeSensor(sensor);
  }

  return {
    mac: tracker.getMAC(),
    ip: tracker.getIP(),
    port: tracker.getPort(),

    signalStrength: tracker.getSignalStrength(),

    mcuType: tracker.getMCUType(),

    batteryLevel: {
      percentage: tracker.getBatteryPercentage(),
      voltage: tracker.getBatteryVoltage()
    },

    sensors
  };
};

export const serializeSensor = (sensor: Sensor): SerializedSensor => {
  return {
    rotation: sensor.getRotation()
  };
};

export const quaternionIsEqualWithEpsilon = (a: Quaternion, b: Quaternion) => {
  return (
    Math.abs(a[0] - b[0]) < 0.0001 &&
    Math.abs(a[1] - b[1]) < 0.0001 &&
    Math.abs(a[2] - b[2]) < 0.0001 &&
    Math.abs(a[3] - b[3]) < 0.0001
  );
};
