import { SensorStatus } from './constants';
import { IncomingCalibrationFinishedPacket } from './packets/IncomingCalibrationFinishedPacket';
import { IncomingTemperaturePacket } from './packets/IncomingTemperaturePacket';
import { Packet } from './packets/Packet';
import { Tracker } from './Tracker';

const IncomingErrorPacket = require('./packets/IncomingErrorPacket');
const IncomingMagnetometerAccuracyPacket = require('./packets/IncomingMagnetometerAccuracy');
const IncomingRawCalibrationDataPacket = require('./packets/IncomingRawCalibrationDataPacket');
const IncomingSensorInfoPacket = require('./packets/IncomingSensorInfoPacket');

export class Sensor {
  private status = SensorStatus.UNKNOWN;

  constructor(private readonly tracker: Tracker, private readonly type: number, private readonly index: number) {}

  private log(msg: string) {
    console.log(`[Tracker:${this.tracker.ip}] [Sensor:${this.index}] ${msg}`);
  }

  handle(packet: Packet) {
    switch (packet.type) {
      case IncomingRawCalibrationDataPacket.type: {
        const rawCalibrationData = /** @type {IncomingRawCalibrationDataPacket} */ packet;

        this.log(`Received raw calibration data for type ${rawCalibrationData.dataType}: ${rawCalibrationData.data.join(', ')}`);

        break;
      }

      case IncomingCalibrationFinishedPacket.type: {
        const calibrationFinished = packet as IncomingCalibrationFinishedPacket;

        this.log(`Received calibration finished for type ${calibrationFinished.dataType}`);

        break;
      }

      case IncomingErrorPacket.type: {
        const error = /** @type {IncomingErrorPacket} */ packet;

        this.log(`Received error: ${error.reason}`);

        break;
      }

      case IncomingSensorInfoPacket.type: {
        const sensorInfo = /** @type {IncomingSensorInfoPacket} */ packet;

        this.status = sensorInfo.sensorStatus;

        this.log('Set up sensor');

        break;
      }

      case IncomingMagnetometerAccuracyPacket.type: {
        const magnetometerAccuracy = /** @type {IncomingMagnetometerAccuracyPacket} */ packet;

        this.log(`Received magnetometer accuracy: ${magnetometerAccuracy.accuracy}`);

        break;
      }

      case IncomingTemperaturePacket.type: {
        const temperature = packet as IncomingTemperaturePacket;

        this.log(`Received temperature: ${temperature.temperature}`);

        break;
      }
    }
  }
}
