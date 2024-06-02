import { Packet } from './Packet';

export class DeviceBoundHandshakePacket extends Packet {
  constructor() {
    super(DeviceBoundHandshakePacket.type);
  }

  static get type() {
    return 3;
  }

  override toString() {
    return 'DeviceBoundHandshakePacket{}';
  }

  encode() {
    const buf = Buffer.alloc(14);

    buf.writeUint8(this.type);

    buf.write('Hey OVR =D 5', 1, 'ascii');

    return buf;
  }
}
