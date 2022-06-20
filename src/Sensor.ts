import { RawCalibrationDataType, SensorStatus } from './constants';
import { IncomingCalibrationFinishedPacket } from './packets/IncomingCalibrationFinishedPacket';
import { IncomingErrorPacket } from './packets/IncomingErrorPacket';
import { IncomingMagnetometerAccuracyPacket } from './packets/IncomingMagnetometerAccuracy';
import { IncomingRawCalibrationDataPacket } from './packets/IncomingRawCalibrationDataPacket';
import { IncomingTemperaturePacket } from './packets/IncomingTemperaturePacket';
import { Packet } from './packets/Packet';
import { Tracker } from './Tracker';

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
        const rawCalibrationData = packet as IncomingRawCalibrationDataPacket;

        this.log(
          `Received raw calibration data for type ${RawCalibrationDataType[rawCalibrationData.dataType]}: ${rawCalibrationData.data.join(', ')}`
        );

        break;
      }

      case IncomingCalibrationFinishedPacket.type: {
        const calibrationFinished = packet as IncomingCalibrationFinishedPacket;

        this.log(`Received calibration finished for type ${calibrationFinished.dataType}`);

        break;
      }

      case IncomingErrorPacket.type: {
        const error = packet as IncomingErrorPacket;

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
        const magnetometerAccuracy = packet as IncomingMagnetometerAccuracyPacket;

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
