const DiscoveryPacket = require('./packets/DiscoveryPacket');
const utils = require('./utils');

const [broadcastAddresses] = utils.getBroadcastAddresses();

module.exports = class ConnectionTracker {
  /**
   * @type {ConnectionTracker}
   */
  static _instance;

  /**
   * @param {import('node:dgram').Socket} [socket]
   */
  static get(socket) {
    if (!this._instance) {
      if (!socket) {
        throw new Error('Socket is required');
      }

      this._instance = new ConnectionTracker(socket);
    }

    return this._instance;
  }

  /**
   * @param {import('node:dgram').Socket} socket
   */
  constructor(socket) {
    this.socket = socket;
  }

  /** @type {Map<string, import('./Tracker')>} */
  _connectionsByMAC = new Map();

  /** @type {Map<string, import('./Tracker')>} */
  _connectionsByIP = new Map();

  /**
   * @param {string} msg
   */
  _log(msg) {
    console.log(`[ConnectionTracker] ${msg}`);
  }

  /**
   * @param {string} ip
   */
  getConnectionByIP(ip) {
    return this._connectionsByIP.get(ip);
  }

  /**
   * @param {string} mac
   */
  getConnectionByMAC(mac) {
    return this._connectionsByMAC.get(mac);
  }

  /**
   * @param {import('./Tracker')} tracker
   */
  addConnection(tracker) {
    this._connectionsByIP.set(tracker.ip, tracker);

    this._log(`Added tracker ${tracker.ip}`);

    if (tracker.mac) {
      this._connectionsByMAC.set(tracker.mac, tracker);
      this._log(`Added tracker ${tracker.mac}`);
    }
  }

  /**
   * @param {string} ip
   */
  removeConnectionByIP(ip) {
    const connection = this._connectionsByIP.get(ip);

    if (connection && connection.mac) {
      this._connectionsByMAC.delete(connection.mac);

      this._log(`Removed tracker ${connection.mac}`);
    }

    this._connectionsByIP.delete(ip);

    this._log(`Removed tracker ${ip}`);
  }

  /**
   * @param {string} mac
   */
  removeConnectionByMAC(mac) {
    const connection = this._connectionsByMAC.get(mac);

    if (connection) {
      this._connectionsByIP.delete(connection.ip);

      this._log(`Removed tracker ${connection.ip}`);
    }

    this._connectionsByMAC.delete(mac);

    this._log(`Removed tracker ${mac}`);
  }

  sendDiscoveryPackets() {
    if (this._connectionsByIP.size > 0 || this._connectionsByMAC.size > 0) {
      return;
    }

    this._log(`Sending discovery packets...`);

    for (const ip of broadcastAddresses) {
      this.socket.send(new DiscoveryPacket().encode(), 6969, ip);
    }
  }

  removeOldConnections() {
    for (const tracker of this._connectionsByIP.values()) {
      if (!tracker.alive) {
        this.removeConnectionByIP(tracker.ip);

        this._log(`Tracker ${tracker.ip} timed out`);
      }
    }

    for (const tracker of this._connectionsByMAC.values()) {
      if (!tracker.alive) {
        this.removeConnectionByMAC(tracker.mac);

        this._log(`Tracker ${tracker.mac} timed out`);
      }
    }
  }

  pingConnections() {
    for (const tracker of this._connectionsByIP.values()) {
      tracker.ping();

      this._log(`Pinged tracker ${tracker.ip}`);
    }
  }
};
