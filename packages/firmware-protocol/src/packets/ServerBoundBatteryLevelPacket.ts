import { Packet } from './Packet';

export class ServerBoundBatteryLevelPacket extends Packet {
  readonly voltage: number;
  readonly percentage: number;

  constructor(number: bigint, data: Buffer) {
    super(number, ServerBoundBatteryLevelPacket.type);

    this.voltage = 0;

    const tmp = data.readFloatBE(0);
    data = data.slice(4);

    if (data.length >= 4) {
      this.percentage = data.readFloatBE(0) * 100;
      this.voltage = tmp;
    } else {
      this.percentage = tmp;
    }
  }

  static get type() {
    return 12;
  }

  override toString() {
    return `ServerBoundBatteryLevelPacket{voltage: ${this.voltage}, percentage: ${this.percentage}}`;
  }

  static encode(number: bigint, voltage: number, percentage: number) {
    const data = Buffer.alloc(4 + 8 + 4 + 4);

    data.writeInt32BE(ServerBoundBatteryLevelPacket.type, 0);
    data.writeBigInt64BE(number, 4);

    data.writeFloatBE(voltage, 12);
    data.writeFloatBE(percentage / 100, 16);

    return data;
  }
}
