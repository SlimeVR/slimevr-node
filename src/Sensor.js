const { sensorStatus } = require('./constants');
const ErrorPacket = require('./packets/ErrorPacket');
const SensorInfoPacket = require('./packets/SensorInfoPacket');

module.exports = class Sensor {
  /**
   * @param {import('./Tracker')} tracker
   * @param {number} type
   * @param {number} index
   */
  constructor(tracker, type, index) {
    this.tracker = tracker;
    this.type = type;
    this.index = index;

    this.status = sensorStatus.UNKNOWN;
  }

  /**
   * @param {string} msg
   */
  _log(msg) {
    console.log(`[Tracker:${this.tracker.ip}] [Sensor:${this.index}] ${msg}`);
  }

  /**
   * @param {import('./packets/Packet')} packet
   */
  handle(packet) {
    switch (packet.type) {
      case SensorInfoPacket.type: {
        const sensorInfo = /** @type {SensorInfoPacket} */ (packet);

        this.status = sensorInfo.sensorStatus;

        this._log(`Set up sensor`);

        break;
      }

      case ErrorPacket.type: {
        const error = /** @type {ErrorPacket} */ (packet);

        this._log(`Received error: ${error.reason}`);

        break;
      }
    }
  }
};
