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
  tracker.on('ready', (ip, port) => console.log(`ready and running on ${ip}:${port}`));
  tracker.on('unready', () => console.log('unready'));

  tracker.on('error', (err) => console.error(err));

  tracker.on('searching-for-server', () => console.log('searching for server...'));
  tracker.on('stopped-searching-for-server', () => console.log('stopped searching for server'));

  tracker.on('connected-to-server', (ip, port) => console.log('connected to server', ip, port));
  tracker.on('disconnected-from-server', (reason) => {
    console.log('disconnected from server', reason);
    tracker.searchForServer();
  });

  tracker.on('server-feature-flags', (flags) => console.log('server feature flags', flags.getAllEnabled()));

  tracker.on('incoming-packet', (packet) => console.log('incoming packet', packet));
  tracker.on('unknown-incoming-packet', (buf) => console.log('unknown packet', buf));
  tracker.on('outgoing-packet', (packet) => console.log('outgoing packet', packet));

  await tracker.init();

  for (let i = 0; i < 3; i++) {
    sensors.push(await tracker.addSensor(SensorType.UNKNOWN, SensorStatus.OK));
  }

  //#region sin wave battery level
  {
    let i = 0;
    setInterval(() => {
      tracker.changeBatteryLevel(Math.sin(i) * 0.5 + 3.7, Math.sin(i) * 50 + 50);
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

  setTimeout(() => {
    tracker.disconnectFromServer();

    tracker.deinit();
  }, 10000);
};

main();
