import { ServerStatus } from '@slimevr/firmware-protocol-debugger-shared';
import React from 'react';
import { useDebuggerStore } from '../store';
import { ServerControlPanel } from './ServerControlPanel';
import { Trackers } from './TrackerList';

export const App: React.FC<unknown> = () => {
  const serverStatus = useDebuggerStore((state) => state.serverStatus);

  return (
    <div className="bg-dark-purple-800 min-h-full text-white p-4 flex flex-col space-y-2">
      <ServerControlPanel />

      {serverStatus === ServerStatus.Running ? <Trackers /> : null}
    </div>
  );
};
