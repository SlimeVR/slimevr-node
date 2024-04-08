import { Quaternion, toQuaternion } from '@slimevr/common';
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
    Math.abs(toQuaternion(a)[0] - toQuaternion(b)[0]) < 0.0001 &&
    Math.abs(toQuaternion(a)[1] - toQuaternion(b)[1]) < 0.0001 &&
    Math.abs(toQuaternion(a)[2] - toQuaternion(b)[2]) < 0.0001 &&
    Math.abs(toQuaternion(a)[3] - toQuaternion(b)[3]) < 0.0001
  );
};
