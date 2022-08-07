import EventEmitter from 'node:events';
import { StrictEventEmitter } from 'strict-event-emitter-types';
import { SerializedTracker, ServerStatus } from '../shared/IPCMessages';

export interface EmittableEvents {
  'server:status': (status: ServerStatus) => void;

  'tracker:new': (tracker: SerializedTracker) => void;
  'tracker:changed': (tracker: SerializedTracker) => void;
  'tracker:removed': (tracker: SerializedTracker) => void;
}

export type Events = StrictEventEmitter<EventEmitter, EmittableEvents>;

export const newEvents = (): Events => {
  return new EventEmitter() as Events;
};
