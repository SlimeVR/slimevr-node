export enum Protocol {
  UNKNOWN = 0,
  OWO_LEGACY = 1,
  SLIMEVR_RAW = 2
}

export enum SensorStatus {
  UNKNOWN = 0,
  OK = 1,
  ERROR = 2
}

export enum RawCalibrationDataType {
  INTERNAL_GYRO = 1,
  INTERNAL_ACCEL = 2,
  INTERNAL_MAG = 3,

  EXTERNAL_ALL = 4,
  EXTERNAL_GYRO = 5,
  EXTERNAL_ACCEL = 6,
  EXTERNAL_MAG = 7
}
