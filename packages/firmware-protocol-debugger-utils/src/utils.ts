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
  const aQuaternion = toQuaternion(a);
  const bQuaternion = toQuaternion(b);

  return (
    Math.abs(aQuaternion[0] - bQuaternion[0]) < 0.0001 &&
    Math.abs(aQuaternion[1] - bQuaternion[1]) < 0.0001 &&
    Math.abs(aQuaternion[2] - bQuaternion[2]) < 0.0001 &&
    Math.abs(aQuaternion[3] - bQuaternion[3]) < 0.0001
  );
};
