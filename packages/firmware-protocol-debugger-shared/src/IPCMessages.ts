import { BoardType, MCUType } from '@slimevr/firmware-protocol';

export type SerializedTracker = {
  mac: string;
  ip: string;
  port: number;

  signalStrength: number;

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
  rotation: SerializedQuaternion;
};

export type SerializedQuaternion = [number, number, number, number];
