import { PacketType } from './constants';
import { ServerBoundCorrectionDataPacket } from './ServerBoundCorrectionDataPacket';
import { ServerBoundFusedIMUDataPacket } from './ServerBoundFusedIMUDataPacket';
import { ServerBoundRawIMUDataPacket } from './ServerBoundRawIMUDataPacket';

export class InspectionPacketParser {
  static parseRawDataPacket = (data: Buffer) => {
    const packetType = data.readUInt8(0);

    data = data.slice(1);

    switch (packetType) {
      case PacketType.RAW:
        return ServerBoundRawIMUDataPacket.fromBuffer(data);

      case PacketType.FUSED:
        return ServerBoundFusedIMUDataPacket.fromBuffer(data);

      case PacketType.CORRECTION:
        return ServerBoundCorrectionDataPacket.fromBuffer(data);

      default:
        console.log(`Unknown packet type: ${PacketType}`);
        return null;
    }
  };

  static get type() {
    return 0x69;
  }
}
