import { Quaternion } from '@slimevr/common';
import { networkInterfaces } from 'os';

export const getBroadcastAddresses = (): [string[], string[]] => {
  const broadcasts: string[] = [];
  const blacklist: string[] = [];

  const ifaces = networkInterfaces();
  for (const i of Object.keys(ifaces)) {
    const iface = ifaces[i];

    if (iface === undefined) {
      continue;
    }

    for (const ip of iface) {
      if (ip.family !== 'IPv4' || ip.internal) {
        continue;
      }

      const split = ip.address.split('.');

      split[3] = '255';

      broadcasts.push(split.join('.'));
      blacklist.push(ip.address);
    }
  }

  return [broadcasts, blacklist];
};

export const quaternionIsEqualWithEpsilon = (a: Quaternion, b: Quaternion) => {
  return (
    Math.abs(a[0] - b[0]) < 0.0001 &&
    Math.abs(a[1] - b[1]) < 0.0001 &&
    Math.abs(a[2] - b[2]) < 0.0001 &&
    Math.abs(a[3] - b[3]) < 0.0001
  );
};
