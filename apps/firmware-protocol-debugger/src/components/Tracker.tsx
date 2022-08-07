import { SerializedTracker } from '@slimevr/firmware-protocol-debugger-shared';
import { FC } from 'react';
import { SensorComponent } from './Sensor';

export const TrackerComponent: FC<{ tracker: SerializedTracker }> = ({ tracker }) => {
  return (
    <div className="rounded-md bg-dark-purple-500">
      <div className="flex mx-2 p-1">
        <span className="font-medium flex-1">
          {tracker.ip}:{tracker.port}
        </span>
        <span className="font-xs text-gray-400">{tracker.mac}</span>
      </div>

      <hr className="border-dark-purple-100" />

      <p className="mx-2 font-xs">
        Battery: {tracker.batteryLevel.voltage.toFixed(2)}V ({tracker.batteryLevel.percentage.toFixed(1)}%)
      </p>

      <p className="mx-2 font-xs">
        WiFi Signal Strength: {tracker.signalStrength}dBm (
        {Math.max(Math.min(((tracker.signalStrength - -95) * (100 - 0)) / (-40 - -95) + 0, 100), 0).toFixed(1)}%)
      </p>

      <hr className="border-dark-purple-100" />

      <div className="flex mx-2 flex-wrap space-x-2">
        {Object.values(tracker.sensors).map((sensor, i) => (
          <SensorComponent sensor={sensor} sensorId={i} key={i} />
        ))}
      </div>
    </div>
  );
};
