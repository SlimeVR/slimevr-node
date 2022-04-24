module.exports = class Packet {
  static ROTATION = 1;
  static SERIAL = 11;
  static ROTATION_2 = 16;
  static PROTOCOL_CHANGE = 200;

  /**
   * @param {number} type
   */
  constructor(type) {
    this.type = type;
  }
};
