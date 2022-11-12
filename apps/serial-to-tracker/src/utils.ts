import { Quaternion, Vector } from '@slimevr/common';
import { SerialPort } from 'serialport';

export const portFlag = async () => {
  const flag = process.argv[2];

  if (!flag) {
    console.error('Please provide a port!');

    const ports = await SerialPort.list();
    console.log('Available ports:');
    for (const port of ports) {
      console.log(`- ${port.path}: ${port.manufacturer}`);
    }

    process.exit(1);
  }

  return flag;
};

export type MACAddress = [number, number, number, number, number, number];

export const getRandomMacAddress = (): MACAddress => {
  return new Array(6).fill(0).map(() => Math.floor(Math.random() * 256)) as MACAddress;
};

export const readQuaternion = (buf: Buffer, offset: number): Quaternion => {
  return [
    buf.readFloatBE(offset),
    buf.readFloatBE(offset + 4),
    buf.readFloatBE(offset + 8),
    buf.readFloatBE(offset + 12)
  ];
};

export const readVector = (buf: Buffer, offset: number): Vector => {
  return [buf.readFloatBE(offset), buf.readFloatBE(offset + 4), buf.readFloatBE(offset + 8)];
};
