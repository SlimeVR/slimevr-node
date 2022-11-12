void sendFloat(void (*write)(char), float value)
{
  unsigned int ivalue = *((unsigned int *)&(value));
  write(ivalue >> 24);
  write(ivalue >> 16);
  write(ivalue >> 8);
  write(ivalue);
}

void ready(void (*write)(char))
{
  write(2);
  write(0x00);
  write(0x02);
}

void rotationData(void (*write)(char), char sensorId, float x, float y, float z, float w)
{
  write(18);
  write(0x01);
  write(sensorId);

  sendFloat(write, x);
  sendFloat(write, y);
  sendFloat(write, z);
  sendFloat(write, w);
}

void accelerationData(void (*write)(char), char sensorId, float x, float y, float z)
{
  write(14);
  write(0x02);
  write(sensorId);

  sendFloat(write, x);
  sendFloat(write, y);
  sendFloat(write, z);
}

void batteryLevel(void (*write)(char), float percentage)
{
  write(6);
  write(0x03);
  write(0x00);

  sendFloat(write, percentage);
}
