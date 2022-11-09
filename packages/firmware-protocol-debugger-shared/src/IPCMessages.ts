import { BoardType, MCUType, Protocol, SensorStatus, SensorType } from '@slimevr/firmware-protocol';

export type SerializedTracker = {
  mac: string;
  ip: string;
  port: number;

  signalStrength: number;
  ping: number;

  protocol: Protocol;
  mcuType: MCUType;
  boardType: BoardType;

  firmware: {
    version: string;
    protocol: number;
  };

  batteryLevel: {
    percentage: number;
    voltage: number;
  };

  sensors: Record<number, SerializedSensor>;
};

export enum ServerStatus {
  Running,
  Stopped
}

export type SerializedSensor = {
  type: SensorType;
  status: SensorStatus;
  magnetometerAccuracy: number;
  temperature: number;

  rotation: SerializedQuaternion;
};

export type SerializedQuaternion = [number, number, number, number];
