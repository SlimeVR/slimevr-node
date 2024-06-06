import { MACAddress } from '@slimevr/common';
import { BoardType, MCUType, SensorType } from '../constants.js';
import { Packet } from './Packet.js';

export class ServerBoundHandshakePacket extends Packet {
  constructor(
    readonly boardType: BoardType,
    readonly imuType: SensorType,
    readonly mcuType: MCUType,
    readonly firmwareBuild: number,
    readonly firmware: string,
    readonly mac: MACAddress
  ) {
    super(ServerBoundHandshakePacket.type);
  }

  static fromBuffer(data: Buffer) {
    let boardType = BoardType.UNKNOWN;
    let imuType = SensorType.UNKNOWN;
    let mcuType = MCUType.UNKNOWN;
    let firmwareBuild = -1;
    let firmware = '';
    let mac = MACAddress.zero();

    if (data.length >= 4) {
      const rawBoardType = data.readInt32BE();

      if (rawBoardType > 0 && rawBoardType < 11) {
        boardType = rawBoardType;
      }

      data = data.slice(4);
    }

    if (data.length >= 4) {
      const rawIMUType = data.readInt32BE();

      if (rawIMUType > 0 && rawIMUType < 10) {
        imuType = rawIMUType;
      }

      data = data.slice(4);
    }

    if (data.length >= 4) {
      const rawMCUType = data.readInt32BE();

      if (rawMCUType > 0 && rawMCUType < 3) {
        mcuType = rawMCUType;
      }

      data = data.slice(4);
    }

    if (data.length >= 12) {
      // Skip IMU imu
      data = data.slice(12);
    }

    if (data.length >= 4) {
      firmwareBuild = data.readInt32BE();
      data = data.slice(4);
    }

    let length = 0;
    if (data.length >= 4) {
      length = data.readUintBE(0, 1);
      data = data.slice(1);
    }

    firmware = this.readAscii(data, length);
    data = data.slice(length);

    if (data.length >= 6) {
      mac = new MACAddress([
        data.readUint8(0),
        data.readUint8(1),
        data.readUint8(2),
        data.readUint8(3),
        data.readUint8(4),
        data.readUint8(5)
      ]);
    }

    return new ServerBoundHandshakePacket(boardType, imuType, mcuType, firmwareBuild, firmware, mac);
  }

  static get type() {
    return 3;
  }

  private static readAscii(data: Buffer, length: number) {
    let buf = '';

    while (length-- > 0) {
      const v = data.readUIntBE(0, 1) & 0xff;

      if (v === 0) {
        break;
      }

      buf += String.fromCharCode(v);

      data = data.slice(1);
    }

    return buf;
  }

  override toString() {
    return `ServerBoundHandshakePacket{boardType: ${BoardType[this.boardType]}, imuType: ${
      SensorType[this.imuType]
    }, mcuType: ${MCUType[this.mcuType]}, firmwareBuild: ${this.firmwareBuild}, firmware: ${this.firmware}, mac: ${
      this.mac
    }}`;
  }

  encode(number: bigint): Buffer {
    const buf = Buffer.alloc(4 + 8 + 4 + 4 + 4 + 4 + 4 + 4 + 4 + 1 + this.firmware.length + 6);

    buf.writeInt32BE(ServerBoundHandshakePacket.type, 0);
    buf.writeBigInt64BE(number, 4);

    buf.writeInt32BE(this.boardType, 12);
    buf.writeInt32BE(this.imuType, 16);
    buf.writeInt32BE(this.mcuType, 20);

    buf.writeInt32BE(0, 24);
    buf.writeInt32BE(0, 28);
    buf.writeInt32BE(0, 32);

    buf.writeInt32BE(this.firmwareBuild, 36);
    buf.writeUInt8(this.firmware.length, 40);
    buf.write(this.firmware, 41);

    this.mac.write(buf, 41 + this.firmware.length);

    return buf;
  }
}
