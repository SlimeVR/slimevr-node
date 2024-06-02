import { MACAddress, Quaternion } from '@slimevr/common';
import {
  BoardType,
  FirmwareFeatureFlags,
  MCUType,
  RotationDataType,
  SensorStatus,
  SensorType
} from '@slimevr/firmware-protocol';
import { EmulatedSensor, EmulatedTracker } from '@slimevr/tracker-emulation';
import BetterQuaternion from 'quaternion';

const tracker = new EmulatedTracker(
  MACAddress.random(),
  '0.0.1',
  new FirmwareFeatureFlags(new Map()),
  BoardType.CUSTOM,
  MCUType.ESP8266
);
const sensors: EmulatedSensor[] = [];

const main = async () => {
  tracker.on('ready', () => {
    console.log('searching for server...');
  });

  tracker.on('connected-to-server', async (ip, port) => {
    console.log('connected to server', ip, port);
  });

  tracker.on('unknown-incoming-packet', (packet) => {
    console.log('unknown packet type', packet.type);
  });

  tracker.on('error', (err) => console.error(err));

  await tracker.init();

  for (let i = 0; i < 3; i++) {
    sensors.push(await tracker.addSensor(SensorType.UNKNOWN, SensorStatus.OK));
  }

  //#region sin wave battery level
  {
    let i = 0;
    setInterval(() => {
      tracker.changeBatteryLevel(Math.sin(i) * 0.5 + 3.7, Math.sin(i) * 100);
      i += 0.1;
    }, 1000).unref();
  }
  //#endregion

  //#region sin wave temperature
  {
    let i = 0;
    setInterval(() => {
      sensors.forEach((sensor) => sensor.sendTemperature(Math.sin(i) * 10 + 25));
      i += 0.1;
    }, 1000).unref();
  }
  //#endregion

  //#region sin wave magnetometer accuracy
  {
    let i = 0;
    setInterval(() => {
      sensors.forEach((sensor) => sensor.sendMagnetometerAccuracy(Math.sin(i) * 3 + 3));
      i += 0.1;
    }, 1000).unref();
  }
  //#endregion

  //#region sin wave signal strength
  {
    let i = 0;
    setInterval(() => {
      sensors.forEach((sensor) => sensor.sendSignalStrength(Math.sin(i) * 127));
      i += 0.1;
    }, 1000).unref();
  }
  //#endregion

  //#region
  {
    let i = 0;
    setInterval(() => {
      sensors.forEach((sensor, idx) => {
        const v = i / 5;
        const better = BetterQuaternion.fromEuler(idx == 0 ? v : 0, idx == 1 ? v : 0, idx == 2 ? v : 0);

        sensor.sendRotation(RotationDataType.NORMAL, new Quaternion(better.x, better.y, better.z, better.w), 0);
      });

      i += 0.1;
    }, 100).unref();
  }
};

main();
