module.exports = class Packet {
  static ROTATION = 1;
  static SERIAL = 11;
  static TAP = 13;
  static ROTATION_2 = 16;
  static MAGNETOMETER_ACCURACY = 18;
  static TEMPERATURE = 20;
  static PROTOCOL_CHANGE = 200;

  /**
   * @param {number} type
   */
  constructor(type) {
    this.type = type;
  }
};
