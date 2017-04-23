const browser = require('os').platform() === 'browser';
const EventEmitter = require('events');
const Constants = require('../../util/Constants');
const zlib = require('zlib');
const PacketManager = require('./packets/WebSocketPacketManager');
const erlpack = (function findErlpack() {
  try {
    const e = require('erlpack');
    if (!e.pack) return null;
    return e;
  } catch (e) {
    return null;
  }
}());

const WebSocket = (function findWebSocket() {
  if (browser) return window.WebSocket; // eslint-disable-line no-undef
  try {
    return require('uws');
  } catch (e) {
    return require('ws');
  }
}());

/**
 * Abstracts a WebSocket connection with decoding/encoding for the discord gateway
 * @private
 */
class WebSocketConnection extends EventEmitter {
  /**
   * @param {WebSocketManager} manager the WebSocket manager
   * @param {string} gateway Websocket gateway to connect to
   */
  constructor(manager, gateway) {
    super();
    this.manager = manager;
    this.client = manager.client;
    this.ws = null;
    this.sequence = -1;
    this.status = Constants.Status.IDLE;
    this.packetManager = new PacketManager(this);
    this.connect(gateway);
  }

  // Util
  debug(message) {
    if (message instanceof Error) message = message.stack;
    return this.manager.debug(`[connection] ${message}`);
  }

  unpack(data) {
    if (erlpack && typeof data !== 'string') {
      if (data instanceof ArrayBuffer) data = Buffer.from(new Uint8Array(data));
      return erlpack.unpack(data);
    } else if (data instanceof ArrayBuffer || data instanceof Buffer) {
      data = zlib.inflateSync(data).toString();
    }
    return JSON.parse(data);
  }

  pack(data) {
    return erlpack ? erlpack.pack(data) : JSON.stringify(data);
  }

  send(data) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      return this.debug(`Tried to send packet ${data} but no WebSocket is available!`);
    }
    return this.ws.send(this.pack(data));
  }

  connect(gateway, after = 0) {
    if (after) return this.client.setTimeout(this.connect.apply(this, gateway), after); // eslint-disable-line
    if (this.ws) return this.debug('WebSocket connection already exists');
    if (typeof gateway !== 'string') return this.debug(`Tried to connect to an invalid gateway: ${gateway}`);

    this.gateway = gateway;

    const ws = this.ws = new WebSocket(gateway);
    if (browser) ws.binaryType = 'arraybuffer';
    ws.onmessage = this.onMessage.bind(this);
    ws.onopen = this.onOpen.bind(this);
    ws.onerror = this.onError.bind(this);
    ws.onclose = this.onClose.bind(this);
    this.status = Constants.Status.CONNECTING;
    return true;
  }

  onMessage(event) {
    try {
      this.onPacket(this.unpack(event.data));
      return true;
    } catch (err) {
      this.debug(err);
      return false;
    }
  }

  setSequence(s) {
    this.sequence = s > this.sequence ? s : this.sequence;
  }

  onPacket(packet) {
    if (!packet) return this.debug('Received null packet');
    this.client.emit('raw', packet);
    switch (packet.op) {
      case Constants.OPCodes.HELLO:
        return this.heartbeat(packet.d.heartbeat_interval);
      case Constants.OPCodes.RECONNECT:
        return this.reconnect();
      case Constants.OPCodes.INVALID_SESSION:
        if (!packet.d) this.sessionID = null;
        return this.identify(packet.d ? 2500 : 0);
      case Constants.OPCodes.HEARTBEAT_ACK:
        // Todo
        break;
      case Constants.OPCodes.HEARTBEAT:
        // Todo
        break;
      default:
        return this.packetManager.handle(packet);
    }
    return false;
  }

  onOpen(event) {
    this.gateway = event.target.url;
    this.debug(`Connected to gateway ${this.gateway}`);
    this.identify();
  }

  onError(error) {

  }

  onClose(event) {

  }

  // Heartbeat
  heartbeat(time) {
    if (!isNaN(time)) {
      if (time === -1) {
        this.debug('Clearing heartbeat interval');
        this.client.clearInterval(this.heartbeatInterval);
      } else {
        this.debug(`Setting a heartbeat interval for ${time}ms`);
        this.heartbeatInterval = this.client.setInterval(this.heartbeat.apply(this), time);
      }
      return;
    }
    this.debug('Sending a heartbeat');
    this.send({
      op: Constants.OPCodes.HEARTBEAT,
      d: this.sequence,
    });
  }

  // Identification
  identify(after) {
    if (after) return this.client.setTimeout(this.identify.apply(this), after);
    return this.sessionID ? this.identifyResume() : this.identifyNew();
  }

  identifyNew() {
    if (!this.client.token) {
      return this.debug('No token available to identify a new session with');
    }
    // Clone the generic payload and assign the token
    const d = Object.assign({ token: this.client.token }, this.client.options.ws);

    // Sharding stuff
    const { shardId, shardCount } = this.client.options;
    if (shardCount > 0) d.shard = [Number(shardId), Number(shardCount)];

    // Send the payload
    this.debug('Identifying as a new session');
    return this.send({ op: Constants.OPCodes.IDENTIFY, d });
  }

  identifyResume() {
    if (!this.sessionID) {
      this.debug('Warning: wanted to resume but session ID not available; identifying as a new session instead');
      return this.identifyNew();
    }
    this.debug(`Attempting to resume session ${this.sessionID}`);

    const d = {
      token: this.client.token,
      session_id: this.sessionID,
      seq: this.sequence,
    };

    return this.send({
      op: Constants.OPCodes.RESUME,
      d,
    });
  }
}

/**
 * Encoding the WebSocket connections will use
 * @type {string}
 */
WebSocketConnection.ENCODING = erlpack ? 'etf' : 'json';
WebSocketConnection.WebSocket = WebSocket;

module.exports = WebSocketConnection;
