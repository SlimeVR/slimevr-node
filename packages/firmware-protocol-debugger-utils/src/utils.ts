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
