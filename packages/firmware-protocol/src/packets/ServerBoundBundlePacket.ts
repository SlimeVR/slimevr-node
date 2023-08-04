import { parse } from './PacketParser';
import { Packet } from './Packet';

export class ServerBoundBundlePacket extends Packet {
  readonly packets: Packet[] = [];

  constructor(number: bigint, data: Buffer) {
    super(number, ServerBoundBundlePacket.type);

    while (data.length > 1) {
      const length = data.readUInt16BE(0);
      data = data.slice(2);

      const packet = parse(data.slice(0, length), false, true);

      data = data.slice(length);

      if (packet === null) continue;

      this.packets.push(packet);
    }
  }

  static get type() {
    return 100;
  }

  override toString() {
    return `ServerBoundBundlePacket{count: ${this.packets.length}, packets: ${this.packets
      .map((p) => p.toString())
      .join(', ')}}`;
  }
}
