import { FC } from 'react';
import { SerializedTracker } from '../shared/IPCMessages';

export const TrackerComponent: FC<{ tracker: SerializedTracker }> = ({ tracker }) => {
  return (
    <div className="rounded-md bg-dark-purple-500">
      <div className="flex mx-2">
        <span className="font-medium flex-1">
          {tracker.ip}:{tracker.port}
        </span>
        <span className="font-xs text-gray-400">{tracker.mac}</span>
      </div>

      <hr className="border-dark-purple-100" />

      <p className="mx-2 font-xs ">
        Battery: {tracker.batteryLevel.voltage.toFixed(2)}V ({tracker.batteryLevel.percentage.toFixed(1)}%)
      </p>
      <p className="mx-2 font-xs">
        WiFi Signal Strength: {tracker.signalStrength}dBm ({' '}
        {Math.max(Math.min(((tracker.signalStrength - -95) * (100 - 0)) / (-40 - -95) + 0, 100), 0).toFixed(1)}%)
      </p>

      <hr className="border-dark-purple-100" />

      <div className="flex mx-2">
        {Object.values(tracker.sensors).map((sensor, i) => {
          return (
            <div key={i} className="flex-1">
              <p className="font-xs flex-auto">{sensor.rotation[0].toFixed(4)}</p>
              <p className="font-xs flex-auto">{sensor.rotation[1].toFixed(4)}</p>
              <p className="font-xs flex-auto">{sensor.rotation[2].toFixed(4)}</p>
              <p className="font-xs flex-auto">{sensor.rotation[3].toFixed(4)}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
