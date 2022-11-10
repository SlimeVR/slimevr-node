import { formatMACAddressDigit } from '@slimevr/common';
import { BoardType, MCUType, SensorType } from '../constants';
import { Packet } from './Packet';

export class IncomingHandshakePacket extends Packet {
  readonly boardType: BoardType;
  readonly imuType: SensorType;
  readonly mcuType: MCUType;
  readonly firmwareBuild: number;
  readonly firmware: string;
  readonly mac: string;

  constructor(number: bigint, data: Buffer) {
    super(number, IncomingHandshakePacket.type);

    this.boardType = BoardType.UNKNOWN;
    this.imuType = SensorType.UNKNOWN;
    this.mcuType = MCUType.UNKNOWN;
    this.firmwareBuild = -1;
    this.firmware = '';
    this.mac = '';

    if (data.length === 0) {
      return;
    }

    if (data.length >= 4) {
      const rawBoardType = data.readInt32BE();

      if (rawBoardType > 0 && rawBoardType < 11) {
        this.boardType = rawBoardType;
      }

      data = data.slice(4);
    }

    if (data.length >= 4) {
      const rawIMUType = data.readInt32BE();

      if (rawIMUType > 0 && rawIMUType < 10) {
        this.imuType = rawIMUType;
      }

      data = data.slice(4);
    }

    if (data.length >= 4) {
      const rawMCUType = data.readInt32BE();

      if (rawMCUType > 0 && rawMCUType < 3) {
        this.mcuType = rawMCUType;
      }

      data = data.slice(4);
    }

    if (data.length >= 12) {
      // Skip IMU imu
      data = data.slice(12);
    }

    if (data.length >= 4) {
      this.firmwareBuild = data.readInt32BE();
      data = data.slice(4);
    }

    let length = 0;
    if (data.length >= 4) {
      length = data.readUintBE(0, 1);
      data = data.slice(1);
    }

    this.firmware = this.readAscii(data, length);
    data = data.slice(length);

    if (data.length >= 6) {
      this.mac = [
        data.readUint8(0),
        data.readUint8(1),
        data.readUint8(2),
        data.readUint8(3),
        data.readUint8(4),
        data.readUint8(5)
      ]
        .map(formatMACAddressDigit)
        .join(':');
    }
  }

  static get type() {
    return 3;
  }

  private readAscii(data: Buffer, length: number) {
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
    return `IncomingHandshakePacket{boardType: ${BoardType[this.boardType]}, imuType: ${
      SensorType[this.imuType]
    }, mcuType: ${MCUType[this.mcuType]}, firmwareBuild: ${this.firmwareBuild}, firmware: ${this.firmware}, mac: ${
      this.mac
    }}`;
  }
}
