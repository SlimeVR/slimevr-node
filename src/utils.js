const os = require('os');

module.exports.getBroadcastAddresses = () => {
  const broadcasts = [];
  const blacklist = [];

  const ifaces = os.networkInterfaces();
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

module.exports.shouldDumpRotationDataPacketsRaw = () => {
  return process.argv.includes('--dump-rotation-data-packets-raw');
};

module.exports.shouldDumpRotationDataPacketsProcessed = () => {
  return process.argv.includes('--dump-rotation-data-packets-processed');
};

module.exports.shouldDumpFusedDataRaw = () => {
  return process.argv.includes('--dump-fused-imu-data-raw');
};

module.exports.shouldDumpFusedDataProcessed = () => {
  return process.argv.includes('--dump-fused-imu-data-processed');
};

module.exports.shouldDumpRawIMUDataRaw = () => {
  return process.argv.includes('--dump-raw-imu-data-raw');
};

module.exports.shouldDumpRawIMUDataProcessed = () => {
  return process.argv.includes('--dump-raw-imu-data-processed');
};
