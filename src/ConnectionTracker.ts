import { Tracker } from './Tracker';

export class ConnectionTracker {
  private static instance: ConnectionTracker;

  static get() {
    if (!this.instance) {
      this.instance = new this();
    }

    return this.instance;
  }

  private readonly connectionsByMAC = new Map<string, Tracker>();
  private readonly connectionsByIP = new Map<string, Tracker>();

  private log(msg: string) {
    console.log(`[ConnectionTracker] ${msg}`);
  }

  getConnectionByIP(ip: string) {
    return this.connectionsByIP.get(ip);
  }

  getConnectionByMAC(mac: string) {
    return this.connectionsByMAC.get(mac);
  }

  addConnection(tracker: Tracker) {
    this.connectionsByIP.set(tracker.ip, tracker);

    this.log(`Added tracker ${tracker.ip}`);

    if (tracker.mac) {
      this.connectionsByMAC.set(tracker.mac, tracker);
      this.log(`Added tracker ${tracker.mac}`);
    }
  }

  removeConnectionByIP(ip: string) {
    const connection = this.connectionsByIP.get(ip);

    if (connection && connection.mac) {
      this.connectionsByMAC.delete(connection.mac);

      this.log(`Removed tracker ${connection.mac}`);
    }

    this.connectionsByIP.delete(ip);

    this.log(`Removed tracker ${ip}`);
  }

  removeConnectionByMAC(mac: string) {
    const connection = this.connectionsByMAC.get(mac);

    if (connection) {
      this.connectionsByIP.delete(connection.ip);

      this.log(`Removed tracker ${connection.ip}`);
    }

    this.connectionsByMAC.delete(mac);

    this.log(`Removed tracker ${mac}`);
  }

  removeOldConnections() {
    for (const tracker of this.connectionsByIP.values()) {
      if (!tracker.alive) {
        this.removeConnectionByIP(tracker.ip);

        this.log(`Tracker ${tracker.ip} timed out`);
      }
    }

    for (const tracker of this.connectionsByMAC.values()) {
      if (!tracker.alive) {
        this.removeConnectionByMAC(tracker.mac);

        this.log(`Tracker ${tracker.mac} timed out`);
      }
    }
  }

  pingConnections() {
    for (const tracker of this.connectionsByIP.values()) {
      tracker.ping();
    }
  }
}
