# SlimeVR Protocol Debugger

> Simple, dependency-less inspection utility written in JavaScript to debug packets sent by owoTrack and SlimeVR trackers

## Requirements

- [Node.JS >= 16.0.0](https://nodejs.org)

## Getting Started

⚠ **Make sure you have stopped the SlimeVR server before running this software!**

```shell
git clone https://github.com/SlimeVR/SlimeVR-Protocol-Debugger
cd SlimeVR-Protocol-Debugger
node . # add flags from below to enable features
```

## Command line flags

- `--dump-all-packets-raw`: Dump all packets to the console.
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

## Enabling extra IMU debug packets

```
git clone https://github.com/SlimeVR/SlimeVR-Tracker-ESP
cd SlimeVR-Tracker-ESP

# Edit src/debug.h
# Set `ENABLE_INSPECTION` to `true`
# Set `POWERSAVING_MODE` to `POWER_SAVING_NONE`
# Flash your ESP
```

## License

All code in this repository is dual-licensed under either:

- MIT License ([LICENSE-MIT](LICENSE-MIT))
- Apache License, Version 2.0 ([LICENSE-APACHE](LICENSE-APACHE))

at your option. This means you can select the license you prefer! This dual-licensing approach is the de-facto standard in the Rust ecosystem and there are very good reasons to include both.

Unless you explicitly state otherwise, any contribution intentionally submitted for inclusion in the work by you, as defined in the Apache-2.0 license, shall be dual licensed as above, without any additional terms or conditions.
