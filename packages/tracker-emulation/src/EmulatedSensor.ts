import { Quaternion, Vector } from '@slimevr/common';
import { RotationDataType, SensorStatus, SensorType, ServerBoundSensorInfoPacket } from '@slimevr/firmware-protocol';
import { EmulatedTracker } from './EmulatedTracker';

export class EmulatedSensor {
  constructor(
    private readonly tracker: EmulatedTracker,
    readonly id: number,
    readonly type: SensorType,
    private _status: SensorStatus
  ) {}

  get status() {
    return this._status;
  }

  async sendSensorInfo() {
    await this.tracker.sendPacketToServer(new ServerBoundSensorInfoPacket(this.id, this._status, this.type));
  }

  async sendRotation(dataType: RotationDataType, rotation: Quaternion, accuracyInfo: number) {
    await this.tracker.sendRotationData(this.id, dataType, rotation, accuracyInfo);
  }

  async sendAcceleration(acceleration: Vector) {
    await this.tracker.sendAcceleration(this.id, acceleration);
  }

  async sendTemperature(temperature: number) {
    await this.tracker.sendTemperature(this.id, temperature);
  }

  async sendMagnetometerAccuracy(accuracy: number) {
    await this.tracker.sendMagnetometerAccuracy(this.id, accuracy);
  }

  /**
   * @param signalStrength The signal strength to send to the server, must be between -127 and 127
   */
  async sendSignalStrength(signalStrength: number) {
    await this.tracker.sendSignalStrength(this.id, signalStrength);
  }

  async changeStatus(status: SensorStatus) {
    this._status = status;
    await this.sendSensorInfo();
  }
}
