# SlimeVR Protocol Debugger GUI

> Simple inspection utility written in JavaScript to debug packets sent by owoTrack and SlimeVR trackers (GUI version)

## Download

You can download the latest version of the GUI from the [releases page](https://github.com/SlimeVR/slimevr-node/releases).

⚠ **Make sure you have stopped the SlimeVR server before running this software!**

## Enabling extra IMU debug packets

```
git clone https://github.com/SlimeVR/SlimeVR-Tracker-ESP
cd SlimeVR-Tracker-ESP

# Edit src/debug.h
# Set `ENABLE_INSPECTION` to `true`
# Set `POWERSAVING_MODE` to `POWER_SAVING_NONE`
# Flash your ESP
```
