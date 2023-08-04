import { BoardType, MCUType, Protocol } from '@slimevr/firmware-protocol';
import { SerializedTracker } from '@slimevr/firmware-protocol-debugger-shared';
import React from 'react';
import { SensorComponent } from './Sensor';

const owoTrackerBadge = () => <span className="font-medium text-black bg-owotrack rounded-md px-1">owoTrack</span>;

const TrackerTypeBadge: React.FC<{ protocol: Protocol; firmware: string }> = ({ protocol, firmware }) => {
  if (firmware.toLowerCase().startsWith('owotrack')) {
    return owoTrackerBadge();
  }

  switch (protocol) {
    case Protocol.UNKNOWN:
      // Technically unreachable
      return <span className="font-medium bg-gray-700 rounded-md px-1">Unknown</span>;

    case Protocol.OWO_LEGACY:
      return owoTrackerBadge();

    case Protocol.SLIMEVR_RAW:
      return <span className="font-medium bg-slimevr rounded-md px-1">SlimeVR</span>;
  }
};

export const TrackerComponent: React.FC<{ tracker: SerializedTracker }> = ({ tracker }) => {
  return (
    <div className="rounded-md bg-dark-purple-500">
      <div className="flex mx-2 p-1">
        <span className="font-medium flex-1">
          {tracker.ip}:{tracker.port}
          <span className="ml-2">
            <TrackerTypeBadge protocol={tracker.protocol} firmware={tracker.firmware.version} />
          </span>
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

      <p className="mx-2 font-xs">Ping: {tracker.ping}ms</p>

      <p className="mx-2 font-xs">Microcontroller: {MCUType[tracker.mcuType]}</p>
      <p className="mx-2 font-xs">Board: {BoardType[tracker.boardType]}</p>

      <p className="mx-2 font-xs">Firmware: {tracker.firmware.version}</p>
      <p className="mx-2 font-xs">Protocol: {tracker.firmware.protocol}</p>

      <hr className="border-dark-purple-100" />

      <div className="flex mx-2 flex-wrap space-x-2 my-2">
        {Object.values(tracker.sensors).map((sensor, i) => (
          <SensorComponent sensor={sensor} sensorId={i} key={i} />
        ))}
      </div>
    </div>
  );
};
