# Serial to SlimeVR-Tracker converter

> This is a simple program that takes in serial data and emulates a SlimeVR tracker.

## Requirements

- [Node.JS >= 16.0.0](https://nodejs.org)

## Getting Started

⚠ **Due to how the SlimeVR server works, you have to run this program on a separate device (eg. a VM with USB passthrough or a laptop)**

```shell
npx @slimevr/serial-to-tracker [SERIAL PORT]
```

ℹ **If you don't specify a serial port, the program will list all of them.**

## Protocol

The protocol is described in [`protocol.c`](src/protocol.c).
