import { FC, useEffect } from 'react';
import { ServerStatus } from '../shared/IPCMessages';
import { useDebuggerStore } from '../store';

export const ServerControlPanel: FC<unknown> = () => {
  const serverStatus = useDebuggerStore((s) => s.serverStatus);
  const setServerStatus = useDebuggerStore((s) => s.setServerStatus);

  useEffect(() => {
    const serverStatusChanged = (_: unknown, status: ServerStatus) => setServerStatus(status);

    api.getServerStatus().then((status) => {
      setServerStatus(status);

      api.onServerStatusChanged(serverStatusChanged);
    });

    return () => {
      api.removeServerStatusChangedListener(serverStatusChanged);
    };

    // React, please don't re-run this when the server status changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="rounded-md bg-dark-purple-500 p-2">
      {serverStatus === ServerStatus.Running ? (
        <button className="bg-red-600 rounded-md px-2 py-1" onClick={() => api.stopServer()}>
          Stop Server
        </button>
      ) : (
        <button className="bg-cyan-600 rounded-md px-2 py-1" onClick={() => api.startServer()}>
          Start Server
        </button>
      )}
    </div>
  );
};
