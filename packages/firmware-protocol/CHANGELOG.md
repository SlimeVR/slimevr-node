# @slimevr/firmware-protocol

## 0.3.0

### Minor Changes

- c523b3a: refactored parsing to support both sides

### Patch Changes

- cc577a0: implement server bound heartbeat packet

## 0.2.0

### Minor Changes

- 1b0eb29: decoupled parsing packets from TrackerLike
- e51b53c: better distinguishing between server bound and device bound packets

### Patch Changes

- e51b53c: implemented support for parsing and encoding the sensor ID of accel packets

## 0.1.1

### Patch Changes

- 2014316: Properly parse incoming board types
- 9301bb5: Set unknown value for SensorType enum to 0 instead of -1
- 55e8f99: Fix parsing of incoming signal strength packets
- 594a929: Properly parse incoming MCU types
- b35f32f: Properly parse incoming IMU types
