const { sensorStatus } = require('./constants');
const IncomingErrorPacket = require('./packets/IncomingErrorPacket');
const IncomingSensorInfoPacket = require('./packets/IncomingSensorInfoPacket');

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
      case IncomingSensorInfoPacket.type: {
        const sensorInfo = /** @type {IncomingSensorInfoPacket} */ (packet);

        this.status = sensorInfo.sensorStatus;

        this._log(`Set up sensor`);

        break;
      }

      case IncomingErrorPacket.type: {
        const error = /** @type {IncomingErrorPacket} */ (packet);

        this._log(`Received error: ${error.reason}`);

        break;
      }
    }
  }
};
