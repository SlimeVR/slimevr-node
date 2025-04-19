# @slimevr/firmware-protocol

## 0.6.6

### Patch Changes

- ff93643: remove tsconfigs from release package
- Updated dependencies [ff93643]
  - @slimevr/common@0.1.3

## 0.6.5

### Patch Changes

- b174be6: Removed mistakenly added MPU6050 softfusion sensor ID

## 0.6.4

### Patch Changes

- 3d3b4fb: Added missing sensor types, MCU types and board types

## 0.6.3

### Patch Changes

- 876591c: fixed ESM and CJS stuff
- Updated dependencies [876591c]
  - @slimevr/common@0.1.2

## 0.6.2

### Patch Changes

- 1b2cd7f: added missing UserAction (21) packet

## 0.6.1

### Patch Changes

- 2aef2cb: fixed declaration maps, allowing to see the source code instead of just types
- Updated dependencies [2aef2cb]
  - @slimevr/common@0.1.1

## 0.6.0

### Minor Changes

- 751dab5: rewrite packet decoding, encoding and parsing

### Patch Changes

- Updated dependencies [751dab5]
  - @slimevr/common@0.1.0

## 0.5.3

### Patch Changes

- 227500c: revert exports change
- Updated dependencies [227500c]
  - @slimevr/common@0.0.5

## 0.5.2

### Patch Changes

- 52e3a81: fix packaging
- Updated dependencies [52e3a81]
  - @slimevr/common@0.0.4

## 0.5.1

### Patch Changes

- 85438bb: Allow Vector and Quaternion types to accept objects
- Updated dependencies [85438bb]
  - @slimevr/common@0.0.3

## 0.5.0

### Minor Changes

- 6e57adf: rename Incoming* packets to ServerBound* to more accurately reflect where they go

## 0.4.1

### Patch Changes

- Updated dependencies [96b22a9]
  - @slimevr/common@0.0.2

## 0.4.0

### Minor Changes

- 422164b: implement feature flag packets
- 8966103: implement packet bundling

### Patch Changes

- 2e9a5c2: fix missing packages
- 2e9a5c2: implement bundling to ESM
- 2e9a5c2: bump dependencies
- Updated dependencies [2e9a5c2]
- Updated dependencies [2e9a5c2]
- Updated dependencies [2e9a5c2]
  - @slimevr/common@0.0.1

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
