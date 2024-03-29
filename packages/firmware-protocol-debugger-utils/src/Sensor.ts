import { Quaternion } from '@slimevr/common';
import {
  IncomingCalibrationFinishedPacket,
  IncomingErrorPacket,
  IncomingMagnetometerAccuracyPacket,
  IncomingRawCalibrationDataPacket,
  IncomingRotationPacket,
  IncomingTemperaturePacket,
  Packet,
  RawCalibrationDataType,
  SensorStatus,
  SensorType,
  ServerBoundRotationDataPacket,
  ServerBoundSensorInfoPacket
} from '@slimevr/firmware-protocol';
import { Events } from './Events';
import { shouldDumpRotationDataPacketsProcessed, shouldDumpRotationDataPacketsRaw } from './flags';
import { serializeTracker } from './serialization';
import { Tracker } from './Tracker';
import { quaternionIsEqualWithEpsilon } from './utils';
import { VectorAggregator } from './VectorAggretator';

export class Sensor {
  private readonly rotation = new VectorAggregator<Quaternion>(4);

  private status = SensorStatus.UNKNOWN;
  private magnetometerAccuracy = 0;
  private temperature = 0;

  constructor(
    private readonly tracker: Tracker,
    private readonly events: Events,
    private readonly type: SensorType,
    private readonly index: number
  ) {}

  private log(msg: string) {
    console.log(`[Tracker:${this.tracker.getIP()}] [Sensor:${this.index}] ${msg}`);
  }

  handle(packet: Packet) {
    switch (packet.type) {
      case IncomingRawCalibrationDataPacket.type: {
        const rawCalibrationData = packet as IncomingRawCalibrationDataPacket;

        this.log(
          `Received raw calibration data for type ${
            RawCalibrationDataType[rawCalibrationData.dataType]
          }: ${rawCalibrationData.data.join(', ')}`
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

      case ServerBoundSensorInfoPacket.type: {
        const sensorInfo = packet as ServerBoundSensorInfoPacket;

        this.status = sensorInfo.sensorStatus;

        this.log('Set up sensor');

        this.events.emit('tracker:changed', serializeTracker(this.tracker));

        break;
      }

      case IncomingMagnetometerAccuracyPacket.type: {
        const magnetometerAccuracy = packet as IncomingMagnetometerAccuracyPacket;

        this.log(`Received magnetometer accuracy: ${magnetometerAccuracy.accuracy}`);

        this.magnetometerAccuracy = magnetometerAccuracy.accuracy;

        this.events.emit('tracker:changed', serializeTracker(this.tracker));

        break;
      }

      case ServerBoundRotationDataPacket.type: {
        const rotation = packet as ServerBoundRotationDataPacket;

        if (shouldDumpRotationDataPacketsRaw()) {
          this.log(rotation.toString());
        }

        const lastQuaternion = this.rotation.latestData;

        this.rotation.update(rotation.rotation);

        if (shouldDumpRotationDataPacketsProcessed()) {
          this.log(`RotPac | ${this.rotation.toString()}`);
        }

        if (!quaternionIsEqualWithEpsilon(lastQuaternion, rotation.rotation)) {
          this.log(`changed rotation: ${rotation.rotation}`);

          this.events.emit('tracker:changed', serializeTracker(this.tracker));
        }

        break;
      }

      case IncomingRotationPacket.type: {
        const rotation = packet as IncomingRotationPacket;

        if (shouldDumpRotationDataPacketsRaw()) {
          this.log(rotation.toString());
        }

        this.rotation.update(rotation.rotation);

        if (shouldDumpRotationDataPacketsProcessed()) {
          this.log(`RotPac | ${this.rotation.toString()}`);
        }

        this.events.emit('tracker:changed', serializeTracker(this.tracker));

        break;
      }

      case IncomingTemperaturePacket.type: {
        const temperature = packet as IncomingTemperaturePacket;

        this.log(`Received temperature: ${temperature.temperature}`);

        this.temperature = temperature.temperature;

        this.events.emit('tracker:changed', serializeTracker(this.tracker));

        break;
      }
    }
  }

  getType(): SensorType {
    return this.type;
  }

  getStatus(): SensorStatus {
    return this.status;
  }

  getMagnetometerAccuracy(): number {
    return this.magnetometerAccuracy;
  }

  getTemperature(): number {
    return this.temperature;
  }

  getRotation() {
    return this.rotation.latestData;
  }
}
