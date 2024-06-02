import { Packet } from './Packet';
import { parse } from './PacketParser';

export class ServerBoundBundlePacket extends Packet {
  constructor(readonly packets: Packet[]) {
    super(ServerBoundBundlePacket.type);
  }

  static fromBuffer(data: Buffer) {
    const packets: Packet[] = [];

    while (data.length > 1) {
      const length = data.readUInt16BE(0);
      data = data.slice(2);

      const [_, packet] = parse(data.slice(0, length), false, true);

      data = data.slice(length);

      if (packet === null) continue;

      packets.push(packet);
    }

    return new ServerBoundBundlePacket(packets);
  }

  static get type() {
    return 100;
  }

  override toString() {
    return `ServerBoundBundlePacket{count: ${this.packets.length}, packets: ${this.packets
      .map((p) => p.toString())
      .join(', ')}}`;
  }

  encode(_num: bigint): Buffer {
    // TODO: Implement this
    throw new Error('Not implemented');
    // const packetBuffers = this.packets.map((p) => p.encode(BigInt(0)));

    // const totalLength = packetBuffers.reduce((acc, buf) => acc + buf.length, 0);

    // const buf = Buffer.alloc(4 + 8 + totalLength);

    // buf.writeInt32BE(ServerBoundBundlePacket.type, 0);
    // buf.writeBigInt64BE(num, 4);

    // let offset = 12;
    // for (const packetBuffer of packetBuffers) {
    //   buf.writeUInt16BE(packetBuffer.length, offset);
    //   offset += 2;

    //   packetBuffer.copy(buf, offset);
    //   offset += packetBuffer.length;
    // }

    // return buf;
  }
}
