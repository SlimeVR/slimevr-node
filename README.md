# SlimeVR.ts

> A library of projects related to SlimeVR implemented in JavaScript and TypeScript.

## Libraries

- [`@slimevr/common`](packages/common): Shared library for the other libraries.
- [`@slimevr/firmware-protocol`](packages/firmware-protocol): A library for encoding and decoding packets of the firmware.
- [`@slimevr/tracker-emulation`](packages/tracker-emulation): A library for emulating a SlimeVR tracker.
  - Used by [SlimeTora](https://github.com/OCSYT/SlimeTora)

## Applications

- [`@slimevr/firmware-protocol-debugger`](apps/firmware-protocol-debugger): A simple firmware protocol debugger for SlimeVR.
- [`slimevr-firmware-protocol-debugger-gui`](apps/firmware-protocol-debugger-gui): A wrapper for `slimevr-firmware-protocol-debugger` with a GUI.
- [`@slimevr/serial-to-tracker`](apps/serial-to-tracker): A simple tool that takes in serial data and emulates a SlimeVR tracker.
- [`@slimevr/emulated-tracker-demo`](apps/emulated-tracker-demo): A demo for the `@slimevr/tracker-emulation` package.

## License

All code in this repository is dual-licensed under either:

- MIT License ([LICENSE-MIT](LICENSE-MIT))
- Apache License, Version 2.0 ([LICENSE-APACHE](LICENSE-APACHE))

at your option. This means you can select the license you prefer!

Unless you explicitly state otherwise, any contribution intentionally submitted for inclusion in the work by you, as defined in the Apache-2.0 license, shall be dual licensed as above, without any additional terms or conditions.
