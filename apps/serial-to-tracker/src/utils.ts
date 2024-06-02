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
