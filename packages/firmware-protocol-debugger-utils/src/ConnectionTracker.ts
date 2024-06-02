import { MACAddress } from '@slimevr/common';
import type { Events } from './Events';
import { serializeTracker } from './serialization';
import type { Tracker } from './Tracker';

export class ConnectionTracker {
  private readonly connectionsByMAC = new Map<string, Tracker>();
  private readonly connectionsByIP = new Map<string, Tracker>();

  constructor(private readonly events: Events) {}

  private log(msg: string) {
    console.log(`[ConnectionTracker] ${msg}`);
  }

  getConnectionByIP(ip: string) {
    return this.connectionsByIP.get(ip);
  }

  getConnectionByMAC(mac: MACAddress) {
    return this.connectionsByMAC.get(mac.toString());
  }

  addConnection(tracker: Tracker) {
    this.connectionsByIP.set(tracker.getIP(), tracker);

    this.log(`Added tracker ${tracker.getIP()}`);

    if (tracker.getMAC()) {
      this.connectionsByMAC.set(tracker.getMAC().toString(), tracker);
      this.log(`Added tracker ${tracker.getMAC()}`);

      this.events.emit('tracker:new', serializeTracker(tracker));
    }
  }

  removeConnectionByIP(ip: string) {
    const connection = this.connectionsByIP.get(ip);

    if (connection && connection.getMAC()) {
      this.connectionsByMAC.delete(connection.getMAC().toString());

      this.log(`Removed tracker ${connection.getMAC()}`);

      this.events.emit('tracker:removed', serializeTracker(connection));
    }

    this.connectionsByIP.delete(ip);

    this.log(`Removed tracker ${ip}`);
  }

  removeConnectionByMAC(mac: MACAddress) {
    const connection = this.connectionsByMAC.get(mac.toString());

    if (connection) {
      this.connectionsByIP.delete(connection.getIP());

      this.log(`Removed tracker ${connection.getIP()}`);

      this.events.emit('tracker:removed', serializeTracker(connection));
    }

    this.connectionsByMAC.delete(mac.toString());

    this.log(`Removed tracker ${mac}`);
  }

  removeOldConnections() {
    for (const tracker of this.connectionsByIP.values()) {
      if (!tracker.alive) {
        this.removeConnectionByIP(tracker.getIP());

        this.log(`Tracker ${tracker.getIP()} timed out`);
      }
    }

    for (const tracker of this.connectionsByMAC.values()) {
      if (!tracker.alive) {
        this.removeConnectionByMAC(tracker.getMAC());

        this.log(`Tracker ${tracker.getMAC()} timed out`);
      }
    }
  }

  removeAllConnections() {
    for (const tracker of this.connectionsByMAC.values()) {
      this.removeConnectionByMAC(tracker.getMAC());
    }

    this.connectionsByIP.clear();
    this.connectionsByMAC.clear();
  }

  pingConnections() {
    for (const tracker of this.connectionsByIP.values()) {
      tracker.ping();
    }
  }
}
