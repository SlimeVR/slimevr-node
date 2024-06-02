import { Vector } from '@slimevr/common';
import { PacketWithSensorId } from '../Packet';
import { DataType } from './constants';

export class ServerBoundRawIMUDataPacket extends PacketWithSensorId {
  constructor(
    sensorId: number,
    readonly rotation: Vector,
    readonly rotationAccuracy: number,
    readonly acceleration: Vector,
    readonly accelerationAccuracy: number,
    readonly magnetometer: Vector,
    readonly magnetometerAccuracy: number
  ) {
    super(ServerBoundRawIMUDataPacket.type, sensorId);
  }

  static fromBuffer(data: Buffer) {
    const sensorId = data.readUInt8(0);

    const dataType = data.readUintBE(1, 1);

    let rotation = Vector.zero();
    let acceleration = Vector.zero();
    let magnetometer = Vector.zero();

    if (dataType === DataType.INT) {
      rotation = Vector.readInt32BE(data, 2);
      acceleration = Vector.readInt32BE(data, 15);
      magnetometer = Vector.readInt32BE(data, 28);
    } else if (dataType === DataType.FLOAT) {
      rotation = Vector.readFloatBE(data, 2);
      acceleration = Vector.readFloatBE(data, 15);
      magnetometer = Vector.readFloatBE(data, 28);
    } else {
      throw new Error('ServerBoundRawIMUDataPacket: data type must be float or int');
    }

    const rotationAccuracy = data.readUintBE(14, 1);
    const accelerationAccuracy = data.readUintBE(27, 1);
    const magnetometerAccuracy = data.readUintBE(40, 1);

    return new ServerBoundRawIMUDataPacket(
      sensorId,
      rotation,
      rotationAccuracy,
      acceleration,
      accelerationAccuracy,
      magnetometer,
      magnetometerAccuracy
    );
  }

  static get type() {
    return 0x6901;
  }

  override toString() {
    return `ServerBoundRawIMUDataPacket{sensorId: ${this.sensorId}, rotation: ${this.rotation}, rotationAccuracy: ${this.rotationAccuracy}, acceleration: ${this.acceleration}, accelerationAccuracy: ${this.accelerationAccuracy}, magnetometer: ${this.magnetometer}, magnetometerAccuracy: ${this.magnetometerAccuracy}}`;
  }

  encode(num: bigint): Buffer {
    const buf = Buffer.alloc(
      4 + 8 + 1 + 1 + this.rotation.byteLength + 1 + this.acceleration.byteLength + 1 + this.magnetometer.byteLength + 1
    );

    buf.writeInt32BE(ServerBoundRawIMUDataPacket.type, 0);
    buf.writeBigInt64BE(num, 4);

    buf.writeUInt8(this.sensorId, 12);
    buf.writeUInt8(DataType.FLOAT, 13);

    this.rotation.writeFloatBE(buf, 14);
    buf.writeUInt8(this.rotationAccuracy, 26);

    this.acceleration.writeFloatBE(buf, 27);
    buf.writeUInt8(this.accelerationAccuracy, 39);

    this.magnetometer.writeFloatBE(buf, 40);
    buf.writeUInt8(this.magnetometerAccuracy, 52);

    return buf;
  }
}
