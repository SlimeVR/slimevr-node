export const shouldDumpAllPacketsRaw = () => {
  return process.argv.includes('--dump-all-packets-raw');
};

export const shouldDumpRotationDataPacketsRaw = () => {
  return process.argv.includes('--dump-rotation-data-packets-raw');
};

export const shouldDumpRotationDataPacketsProcessed = () => {
  return process.argv.includes('--dump-rotation-data-packets-processed');
};

export const rotationDataPacketDumpFile = () => {
  const index = process.argv.indexOf('--rotation-data-packets-file');
  if (index === -1) {
    return '';
  }

  return process.argv[index + 1];
};

export const shouldDumpFusedDataRaw = () => {
  return process.argv.includes('--dump-fused-imu-data-raw');
};

export const shouldDumpFusedDataProcessed = () => {
  return process.argv.includes('--dump-fused-imu-data-processed');
};

export const fusedIMUDataDumpFile = () => {
  const index = process.argv.indexOf('--fused-imu-data-file');
  if (index === -1) {
    return '';
  }

  return process.argv[index + 1];
};

export const shouldDumpRawIMUDataRaw = () => {
  return process.argv.includes('--dump-raw-imu-data-raw');
};

export const shouldDumpRawIMUDataProcessed = () => {
  return process.argv.includes('--dump-raw-imu-data-processed');
};

export const rawIMUDataDumpFile = () => {
  const index = process.argv.indexOf('--raw-imu-data-file');
  if (index === -1) {
    return '';
  }

  return process.argv[index + 1];
};

export const shouldDumpCorrectionDataRaw = () => {
  return process.argv.includes('--dump-correction-data-raw');
};

export const shouldDumpCorrectionDataProcessed = () => {
  return process.argv.includes('--dump-correction-data-processed');
};

export const correctionDataDumpFile = () => {
  const index = process.argv.indexOf('--correction-data-file');
  if (index === -1) {
    return '';
  }

  return process.argv[index + 1];
};
