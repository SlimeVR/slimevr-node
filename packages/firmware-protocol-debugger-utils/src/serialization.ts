import { SerializedSensor, SerializedTracker } from '@slimevr/firmware-protocol-debugger-shared';
import { Sensor } from './Sensor';
import { Tracker } from './Tracker';

export const serializeTracker = (tracker: Tracker): SerializedTracker => {
  const sensors: Record<string, SerializedSensor> = {};

  for (const [index, sensor] of Object.entries(tracker.getSensors())) {
    sensors[index] = serializeSensor(sensor);
  }

  return {
    mac: tracker.getMAC().toString(),
    ip: tracker.getIP(),
    port: tracker.getPort(),

    ping: tracker.getPing(),

    protocol: tracker.getProtocol(),
    mcuType: tracker.getMCUType(),
    boardType: tracker.getBoardType(),

    firmware: {
      version: tracker.getFirmware(),
      protocol: tracker.getFirmwareBuild()
    },

    batteryLevel: {
      percentage: tracker.getBatteryPercentage(),
      voltage: tracker.getBatteryVoltage()
    },

    sensors
  };
};

export const serializeSensor = (sensor: Sensor): SerializedSensor => {
  return {
    type: sensor.getType(),
    status: sensor.getStatus(),
    magnetometerAccuracy: sensor.getMagnetometerAccuracy(),
    temperature: sensor.getTemperature(),
    signalStrength: sensor.getSignalStrength(),
    rotation: sensor.getRotation().bytes
  };
};
