const { sensorStatus } = require('./constants');
const IncomingCalibrationFinishedPacket = require('./packets/IncomingCalibrationFinishedPacket');
const IncomingErrorPacket = require('./packets/IncomingErrorPacket');
const IncomingMagnetometerAccuracyPacket = require('./packets/IncomingMagnetometerAccuracy');
const IncomingRawCalibrationDataPacket = require('./packets/IncomingRawCalibrationDataPacket');
const IncomingSensorInfoPacket = require('./packets/IncomingSensorInfoPacket');
const IncomingTemperaturePacket = require('./packets/IncomingTemperaturePacket');

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
      case IncomingRawCalibrationDataPacket.type: {
        const rawCalibrationData = /** @type {IncomingRawCalibrationDataPacket} */ (packet);

        this._log(`Received raw calibration data for type ${rawCalibrationData.dataType}: ${rawCalibrationData.data.join(', ')}`);

        break;
      }

      case IncomingCalibrationFinishedPacket.type: {
        const calibrationFinished = /** @type {IncomingCalibrationFinishedPacket} */ (packet);

        this._log(`Received calibration finished for type ${calibrationFinished.dataType}`);

        break;
      }

      case IncomingErrorPacket.type: {
        const error = /** @type {IncomingErrorPacket} */ (packet);

        this._log(`Received error: ${error.reason}`);

        break;
      }

      case IncomingSensorInfoPacket.type: {
        const sensorInfo = /** @type {IncomingSensorInfoPacket} */ (packet);

        this.status = sensorInfo.sensorStatus;

        this._log('Set up sensor');

        break;
      }

      case IncomingMagnetometerAccuracyPacket.type: {
        const magnetometerAccuracy = /** @type {IncomingMagnetometerAccuracyPacket} */ (packet);

        this._log(`Received magnetometer accuracy: ${magnetometerAccuracy.accuracy}`);

        break;
      }

      case IncomingTemperaturePacket.type: {
        const temperature = /** @type {IncomingTemperaturePacket} */ (packet);

        this._log(`Received temperature: ${temperature.temperature}`);

        break;
      }
    }
  }
};
