import { Packet } from './Packet.js';

export class ServerBoundBatteryLevelPacket extends Packet {
  constructor(readonly voltage: number, readonly percentage: number) {
    super(ServerBoundBatteryLevelPacket.type);
  }

  static fromBuffer(data: Buffer) {
    let voltage = 0;
    let percentage = 0;

    const tmp = data.readFloatBE(0);
    data = data.slice(4);

    if (data.length >= 4) {
      percentage = data.readFloatBE(0) * 100;
      voltage = tmp;
    } else {
      percentage = tmp;
    }

    return new ServerBoundBatteryLevelPacket(voltage, percentage);
  }

  static get type() {
    return 12;
  }

  override toString() {
    return `ServerBoundBatteryLevelPacket{voltage: ${this.voltage}, percentage: ${this.percentage}}`;
  }

  encode(num: bigint): Buffer {
    const data = Buffer.alloc(4 + 8 + 4 + 4);

    data.writeInt32BE(ServerBoundBatteryLevelPacket.type, 0);
    data.writeBigInt64BE(num, 4);

    data.writeFloatBE(this.voltage, 12);
    data.writeFloatBE(this.percentage / 100, 16);

    return data;
  }
}
