export type VectorInit = [number, number, number] | { x: number; y: number; z: number };
export class Vector {
  constructor(public x: number, public y: number, public z: number) {}

  static from(init: VectorInit) {
    if (Array.isArray(init)) {
      return new Vector(init[0], init[1], init[2]);
    } else {
      return new Vector(init.x, init.y, init.z);
    }
  }

  static readFloatBE(buf: Buffer, offset: number) {
    return new Vector(buf.readFloatBE(offset), buf.readFloatBE(offset + 4), buf.readFloatBE(offset + 8));
  }

  static readInt32BE(buf: Buffer, offset: number) {
    return new Vector(buf.readInt32BE(offset), buf.readInt32BE(offset + 4), buf.readInt32BE(offset + 8));
  }

  writeFloatBE(buf: Buffer, offset: number) {
    buf.writeFloatBE(this.x, offset);
    buf.writeFloatBE(this.y, offset + 4);
    buf.writeFloatBE(this.z, offset + 8);
  }

  writeInt32BE(buf: Buffer, offset: number) {
    buf.writeInt32BE(this.x, offset);
    buf.writeInt32BE(this.y, offset + 4);
    buf.writeInt32BE(this.z, offset + 8);
  }

  static zero() {
    return new Vector(0, 0, 0);
  }

  get byteLength() {
    return 3 * 4;
  }

  get bytes() {
    return [this.x, this.y, this.z] as const;
  }

  toString() {
    return `(${this.x}, ${this.y}, ${this.z})`;
  }
}

export type QuaternionInit = [number, number, number, number] | { x: number; y: number; z: number; w: number };
export class Quaternion {
  constructor(public x: number, public y: number, public z: number, public w: number) {}

  static from(init: QuaternionInit) {
    if (Array.isArray(init)) {
      return new Quaternion(init[0], init[1], init[2], init[3]);
    } else {
      return new Quaternion(init.x, init.y, init.z, init.w);
    }
  }

  static read(buf: Buffer, offset: number) {
    return new Quaternion(
      buf.readFloatBE(offset),
      buf.readFloatBE(offset + 4),
      buf.readFloatBE(offset + 8),
      buf.readFloatBE(offset + 12)
    );
  }

  write(buf: Buffer, offset: number) {
    buf.writeFloatBE(this.x, offset);
    buf.writeFloatBE(this.y, offset + 4);
    buf.writeFloatBE(this.z, offset + 8);
    buf.writeFloatBE(this.w, offset + 12);
  }

  static zero() {
    return new Quaternion(0, 0, 0, 1);
  }

  isSimilarTo(q: Quaternion, e = 0.0001) {
    return (
      Math.abs(this.x - q.x) < e &&
      Math.abs(this.y - q.y) < e &&
      Math.abs(this.z - q.z) < e &&
      Math.abs(this.w - q.w) < e
    );
  }

  get byteLength() {
    return 4 * 4;
  }

  get bytes() {
    return [this.x, this.y, this.z, this.w] as const;
  }

  toString() {
    return `(${this.x}, ${this.y}, ${this.z}, ${this.w})`;
  }
}

export const formatMACAddressDigit = (mac: number) => {
  return mac.toString(16).padStart(2, '0').toUpperCase();
};

type MACAddressBytes = [number, number, number, number, number, number];
export class MACAddress {
  constructor(private readonly bytes: MACAddressBytes) {}

  write(buf: Buffer, offset: number) {
    for (let i = 0; i < this.bytes.length; i++) {
      buf.writeUInt8(this.bytes[i], offset + i);
    }
  }

  toString() {
    return this.bytes.map(formatMACAddressDigit).join(':');
  }

  static zero() {
    return new MACAddress([0, 0, 0, 0, 0, 0]);
  }

  static random() {
    return new MACAddress(new Array(6).fill(0).map(() => Math.floor(Math.random() * 256)) as MACAddressBytes);
  }
}
