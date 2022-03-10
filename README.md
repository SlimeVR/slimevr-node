# SlimeVR Tracker Inspector

> Simple SlimeVR inspection utility written in JavaScript with (almost) no dependencies

## Requirements

- [Node.JS >= 14](https://nodejs.org)

## Getting Started

Make sure you stopped the SlimeVR server before running this utility.

```shell
git clone https://github.com/SlimeVR/SlimeVR-Tracker-ESP
cd SlimeVR-Tracker-ESP

# Edit src/debug.h
# Set `ENABLE_INSPECTION` to `true`
# Set `POWERSAVING_MODE` to `POWER_SAVING_NONE`

# Flash your ESP

cd ..

git clone https://github.com/TheDevMinerTV/SlimeVR-Tracker-Inspector
cd SlimeVR-Tracker-Inspector
node . # add flags from below to enable features
```

## Flags

- `--dump-rotation-data-packets-raw`: Dump all RotationData packets to the console.
- `--dump-rotation-data-packets-processed`: Process the RotationData packets with averaging and standard distribution and dump them to the console.
- `--rotation-data-packets-file <file.csv>`: Dump all RotationData packets to a file in CSV format.
- `--dump-fused-imu-data-raw`: Dump all FusedIMUData packets to the console.
- `--dump-fused-imu-data-processed`: Process the FusedIMUData packets with averaging and standard distribution and dump them to the console.
- `--fused-imu-data-file <file.csv>`: Dump all FusedIMUData packets to a file in CSV format.
- `--dump-raw-imu-data-raw`: Dump all RawIMUData packets to the console.
- `--dump-raw-imu-data-processed`: Process the RawIMUData packets with averaging and standard distribution and dump them to the console.
- `--raw-imu-data-file <file.csv>`: Dump all RawIMUData packets to a file in CSV format.
- `--dump-correction-data-raw`: Dump all CorrectionData packets to the console.
- `--dump-correction-data-processed`: Process the CorrectionData packets with averaging and standard distribution and dump them to the console.
- `--correction-data-file <file.csv>`: Dump all CorrectionData packets to a file in CSV format.
