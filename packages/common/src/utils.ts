export type Vector = [number, number, number] | { x: number; y: number; z: number };
export type Quaternion = [number, number, number, number] | { x: number; y: number; z: number; w: number };

export function toVector(v: Vector): [number, number, number] {
  return Array.isArray(v) ? v : [v.x, v.y, v.z];
}

export function toQuaternion(q: Quaternion): [number, number, number, number] {
  return Array.isArray(q) ? q : [q.x, q.y, q.z, q.w];
}

export const formatMACAddressDigit = (mac: number) => {
  return mac.toString(16).padStart(2, '0').toUpperCase();
};
