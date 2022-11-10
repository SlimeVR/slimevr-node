export abstract class Packet {
  // Not implemented
  static readonly SERIAL = 11;
  static readonly ROTATION_2 = 16;
  static readonly PROTOCOL_CHANGE = 200;

  constructor(readonly number: bigint, readonly type: number) {}
}

export abstract class PacketWithSensorId extends Packet {
  constructor(number: bigint, type: number, readonly sensorId: number) {
    super(number, type);
  }
}
