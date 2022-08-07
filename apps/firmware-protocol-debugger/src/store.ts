import { SerializedTracker, ServerStatus } from '@slimevr/firmware-protocol-debugger-shared';
import create from 'zustand';
import { devtools } from 'zustand/middleware';

export type Store = {
  serverStatus: ServerStatus;
  trackers: Record<string, SerializedTracker>;

  setServerStatus(status: ServerStatus): void;

  addTracker: (tracker: SerializedTracker) => void;
  removeTracker: (tracker: SerializedTracker) => void;
  updateTracker: (tracker: SerializedTracker) => void;
};

export const useDebuggerStore = create<Store>()(
  devtools((set, get) => ({
    serverStatus: ServerStatus.Stopped,
    trackers: {},

    setServerStatus(status: ServerStatus) {
      set((state) => ({ ...state, serverStatus: status }));
    },

    addTracker: (tracker: SerializedTracker) => {
      set((state) => ({ ...state, trackers: { ...state.trackers, [tracker.mac]: tracker } }));
    },
    removeTracker: (tracker: SerializedTracker) => {
      set((state) => {
        const { [tracker.mac]: _, ...newTrackers } = state.trackers;

        return { ...state, trackers: newTrackers };
      });
    },
    updateTracker: (tracker: SerializedTracker) => {
      set((state) => ({
        ...state,
        trackers: { ...state.trackers, [tracker.mac]: tracker }
      }));
    }
  }))
);
