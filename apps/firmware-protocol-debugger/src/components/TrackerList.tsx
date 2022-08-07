import { SerializedTracker } from '@slimevr/firmware-protocol-debugger-shared';
import { FC, useEffect } from 'react';
import { useDebuggerStore } from '../store';
import { TrackerComponent } from './Tracker';

export const Trackers: FC<unknown> = () => {
  const trackers = useDebuggerStore((state) => state.trackers);
  const addTracker = useDebuggerStore((state) => state.addTracker);
  const removeTracker = useDebuggerStore((state) => state.removeTracker);
  const updateTracker = useDebuggerStore((state) => state.updateTracker);

  useEffect(() => {
    const newTracker = (_: unknown, tracker: SerializedTracker) => addTracker(tracker);
    const trackerChanged = (_: unknown, tracker: SerializedTracker) =>
      updateTracker(tracker);
    const trackerRemoved = (e: unknown, tracker: SerializedTracker) => removeTracker(tracker);

    api.getTrackers().then((trackers) => {
      Object.values(trackers).forEach((tracker) => addTracker(tracker));

      api.onNewTracker(newTracker);
      api.onTrackerChanged(trackerChanged);
      api.onTrackerRemoved(trackerRemoved);
    });

    return () => {
      api.removeNewTrackerListener(newTracker);
      api.removeTrackerChangedListener(trackerChanged);
      api.removeTrackerRemovedListener(trackerRemoved);
    };

    // React, please don't re-run this when the trackers change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="rounded-md">
      <p className="text-lg">Trackers</p>

      <div className="flex flex-col space-y-2">
        {Object.values(trackers).map((tracker) => (
          <TrackerComponent tracker={tracker} key={tracker.mac} />
        ))}
      </div>
    </div>
  );
};
