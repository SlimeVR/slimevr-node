import { IpcRenderer, IpcRendererEvent } from 'electron';
import { SerializedTracker, ServerStatus } from './shared/IPCMessages';

declare global {
  const api: {
    getServerStatus: () => Promise<ServerStatus>;
    startServer: () => void;
    stopServer: () => void;
    onServerStatusChanged: (callback: (event: IpcRendererEvent, status: ServerStatus) => void) => void;
    removeServerStatusChangedListener: (callback: (event: IpcRenderer, status: ServerStatus) => void) => void;

    getTrackers: () => Promise<Record<string, SerializedTracker>>;
    onNewTracker: (callback: (_: unknown, tracker: SerializedTracker) => void) => void;
    removeNewTrackerListener: (callback: (_: unknown, tracker: SerializedTracker) => void) => void;
    onTrackerChanged: (callback: (_: unknown, tracker: SerializedTracker) => void) => void;
    removeTrackerChangedListener: (callback: (_: unknown, tracker: SerializedTracker) => void) => void;
    onTrackerRemoved: (callback: (_: unknown, tracker: SerializedTracker) => void) => void;
    removeTrackerRemovedListener: (callback: (_: unknown, tracker: SerializedTracker) => void) => void;
  };
}
