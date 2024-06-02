import { MACAddress, Quaternion, Vector } from '@slimevr/common';
import {
  BoardType,
  DeviceBoundHandshakePacket,
  DeviceBoundHeartbeatPacket,
  DeviceBoundPingPacket,
  DeviceBoundSensorInfoPacket,
  MCUType,
  parse,
  RotationDataType,
  SensorStatus,
  SensorType,
  ServerBoundAccelPacket,
  ServerBoundBatteryLevelPacket,
  ServerBoundHandshakePacket,
  ServerBoundHeartbeatPacket,
  ServerBoundPongPacket,
  ServerBoundRotationDataPacket,
  ServerBoundSensorInfoPacket
} from '@slimevr/firmware-protocol';
import { createSocket, RemoteInfo, Socket } from 'node:dgram';
import { SerialPort } from 'serialport';
import { portFlag } from './utils';

const READY_TYPE = 0x00;
const ROTATION_DATA_TYPE = 0x01;
const ACCELERATION_DATA_TYPE = 0x02;
const BATTERY_LEVEL = 0x03;

type State =
  | { state: 'starting'; mac: MACAddress }
  | {
      state: 'waiting-for-dongle-ready';
      mac: MACAddress;
      socket: Socket;
      serial: SerialPort;
    }
  | {
      state: 'dongle-ready';
      mac: MACAddress;
      socket: Socket;
      serial: SerialPort;
      numImus: number;
    }
  | {
      state: 'searching-for-server';
      mac: MACAddress;
      socket: Socket;
      serial: SerialPort;
      numImus: number;
    }
  | {
      state: 'connected-to-server';
      mac: MACAddress;
      socket: Socket;
      serial: SerialPort;
      serverAddress: string;
      serverPort: number;
      packetNumber: bigint;
      numImus: number;
      lowestBatteryLevel: number;
    };

let state = {
  state: 'starting',
  mac: MACAddress.random()
} as State;

const send = (socket: Socket, addr: string, port: number, data: Buffer) => {
  // console.log(data.toString('hex'));
  socket.send(data, port, addr);
};

const parsePacket = (data: Buffer) => {
  // console.log('serial', data.toString('hex'));
  const type = data.readUInt8(0);

  switch (type) {
    case READY_TYPE: {
      const numImus = data.readUInt8(1);

      return {
        type: READY_TYPE,
        numImus
      } as const;
    }

    case ROTATION_DATA_TYPE: {
      const sensorId = data.readUInt8(1);
      const rotation = Quaternion.read(data, 2);

      return {
        type: ROTATION_DATA_TYPE,
        sensorId,
        rotation
      } as const;
    }

    case ACCELERATION_DATA_TYPE: {
      const sensorId = data.readUInt8(1);
      const acceleration = Vector.readFloatBE(data, 2);

      return {
        type: ACCELERATION_DATA_TYPE,
        sensorId,
        acceleration
      } as const;
    }

    case BATTERY_LEVEL: {
      const sensorId = data.readUInt8(1);
      const batteryLevel = data.readFloatBE(2);

      return {
        type: BATTERY_LEVEL,
        sensorId,
        batteryLevel
      } as const;
    }

    default:
      return null;
  }
};

const connectToServer = () => {
  return new Promise<void>((resolve) => {
    if (state.state !== 'dongle-ready') {
      throw new Error('Not ready');
    }

    console.log('connecting to server...');

    state = {
      state: 'searching-for-server',
      mac: state.mac,
      socket: state.socket,
      serial: state.serial,
      numImus: state.numImus
    };

    const searchForServerInterval = setInterval(() => {
      if (state.state !== 'searching-for-server') {
        clearInterval(searchForServerInterval);
        return;
      }

      console.log('searching for server...');

      send(
        state.socket,
        '172.31.179.23',
        6969,
        new ServerBoundHandshakePacket(
          BoardType.CUSTOM,
          SensorType.BMI160,
          MCUType.UNKNOWN,
          13,
          '0.0.1',
          state.mac
        ).encode(0n)
      );
    }, 1000);

    const onSocketMessage = (msg: Buffer, rinfo: RemoteInfo) => {
      if (state.state !== 'searching-for-server') {
        console.log('huh');

        return;
      }

      console.log('got message from server', msg.toString('hex'));

      if (msg.readUint8(0) !== DeviceBoundHandshakePacket.type) {
        return;
      }

      clearInterval(searchForServerInterval);
      state.socket.removeListener('message', onSocketMessage);

      if (state.state !== 'searching-for-server') {
        resolve();
        return;
      }

      console.log('connected to server!');

      state = {
        state: 'connected-to-server',
        mac: state.mac,
        socket: state.socket,
        serial: state.serial,
        serverAddress: rinfo.address,
        serverPort: rinfo.port,
        packetNumber: 0n,
        numImus: state.numImus,
        lowestBatteryLevel: 100
      };

      resolve();
    };

    state.socket.on('message', onSocketMessage);
  });
};

const sendSensorInfo = () => {
  if (state.state !== 'connected-to-server') {
    console.error('Not connected to server');
    return;
  }

  for (let i = 0; state.numImus > i; i++) {
    send(
      state.socket,
      state.serverAddress,
      state.serverPort,
      new ServerBoundSensorInfoPacket(i, SensorStatus.OK, SensorType.BMI160).encode(state.packetNumber)
    );
    state.packetNumber += 1n;

    console.log(`sent sensor info for ${i}!`);
  }
};

const main = async () => {
  const port = await portFlag();
  const socket = createSocket('udp4');
  const serial = await new Promise<SerialPort>((res, rej) => {
    const serial = new SerialPort(
      {
        baudRate: 115200,
        path: port,
        autoOpen: true
        // dataBits: 7,
        // rtscts: true
      },
      (err) => {
        if (err) {
          rej(err);
        } else {
          res(serial);
        }
      }
    );
  });
  console.log('connected to serial');

  let buf = Buffer.alloc(0);
  serial.on('data', (data) => {
    buf = Buffer.concat([buf, data]);

    // run length encoding
    while (buf.length > 0) {
      const len = buf.readUInt8(0);
      if (buf.length < len + 1) {
        break;
      }

      const parsed = parsePacket(buf.slice(1, len + 1));
      if (parsed === null) {
        continue;
      }

      switch (parsed.type) {
        case READY_TYPE: {
          if (state.state !== 'waiting-for-dongle-ready') {
            break;
          }

          state = {
            state: 'dongle-ready',
            mac: state.mac,
            socket: socket,
            serial: serial,
            numImus: parsed.numImus
          };

          console.log('dongle is ready!');

          connectToServer().then(() => sendSensorInfo());

          break;
        }

        case ROTATION_DATA_TYPE: {
          if (state.state === 'connected-to-server') {
            send(
              state.socket,
              state.serverAddress,
              state.serverPort,
              new ServerBoundRotationDataPacket(parsed.sensorId, RotationDataType.NORMAL, parsed.rotation, 0).encode(
                state.packetNumber
              )
            );
            state.packetNumber += 1n;
          } else {
            // console.log('unexpected rotation data, not connected to server');
          }

          break;
        }

        case ACCELERATION_DATA_TYPE: {
          if (state.state === 'connected-to-server') {
            send(
              state.socket,
              state.serverAddress,
              state.serverPort,
              new ServerBoundAccelPacket(parsed.sensorId, parsed.acceleration).encode(state.packetNumber)
            );
            state.packetNumber += 1n;
          } else {
            // console.log('unexpected acceleration data, not connected to server');
          }

          break;
        }

        case BATTERY_LEVEL: {
          if (state.state === 'connected-to-server') {
            state.lowestBatteryLevel = Math.min(state.lowestBatteryLevel, parsed.batteryLevel);

            send(
              state.socket,
              state.serverAddress,
              state.serverPort,
              new ServerBoundBatteryLevelPacket(
                ((4.2 - 3.7) * state.lowestBatteryLevel) / 100 + 3.7,
                state.lowestBatteryLevel
              ).encode(state.packetNumber)
            );
            state.packetNumber += 1n;
          } else {
            // console.log('unexpected battery level, not connected to server');
          }

          break;
        }
      }

      buf = buf.slice(len + 1);
    }
  });

  socket.on('message', (msg, rinfo) => {
    if (
      state.state !== 'connected-to-server' ||
      (rinfo.address !== state.serverAddress && rinfo.port !== state.serverPort)
    ) {
      return;
    }

    const [_num, packet] = parse(msg, true);
    if (packet === null) {
      return;
    }

    switch (packet.type) {
      case DeviceBoundPingPacket.type:
        send(
          state.socket,
          state.serverAddress,
          state.serverPort,
          new ServerBoundPongPacket((packet as DeviceBoundPingPacket).id).encode(state.packetNumber)
        );
        state.packetNumber += 1n;

        break;

      case DeviceBoundHeartbeatPacket.type: {
        send(
          state.socket,
          state.serverAddress,
          state.serverPort,
          new ServerBoundHeartbeatPacket().encode(state.packetNumber)
        );
        state.packetNumber += 1n;

        break;
      }

      case DeviceBoundSensorInfoPacket.type: {
        // Ignore
        break;
      }

      default:
        console.log('unknown packet type', packet.type);
        break;
    }
  });

  socket.on('error', (err) => {
    console.error(err);
  });

  socket.bind(0, '0.0.0.0');
  await new Promise<void>((resolve) => socket.once('listening', () => resolve()));
  state = {
    state: 'waiting-for-dongle-ready',
    mac: state.mac,
    socket,
    serial
  };

  // socket.setBroadcast(true);

  console.log('listening!');

  console.log('waiting for dongle to be ready...');
};

main();
