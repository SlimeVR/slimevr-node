import { PacketType } from './constants';
import { ServerBoundCorrectionDataPacket } from './ServerBoundCorrectionDataPacket';
import { ServerBoundFusedIMUDataPacket } from './ServerBoundFusedIMUDataPacket';
import { ServerBoundRawIMUDataPacket } from './ServerBoundRawIMUDataPacket';

export class InspectionPacketParser {
  static parseRawDataPacket = (number: bigint, data: Buffer) => {
    const packetType = data.readUInt8(0);

    data = data.slice(1);

    switch (packetType) {
      case PacketType.RAW:
        return new ServerBoundRawIMUDataPacket(number, data);

      case PacketType.FUSED:
        return new ServerBoundFusedIMUDataPacket(number, data);

      case PacketType.CORRECTION:
        return new ServerBoundCorrectionDataPacket(number, data);

      default:
        console.log(`Unknown packet type: ${PacketType}`);
        return null;
    }
  };

  static get type() {
    return 0x69;
  }
}
