const AbstractHandler = require('./AbstractHandler');
const Constants = require('../../../../util/Constants');

class ResumedHandler extends AbstractHandler {
  handle(packet) {
    const client = this.packetManager.client;
    const ws = client.ws.connection;

    ws._trace = packet.d._trace;

    ws.status = Constants.Status.READY;
    this.packetManager.handleQueue();

    const replayed = ws.sequence - ws.closeSequence;

    client.emit('debug', `RESUMED ${ws._trace.join(' -> ')} | replayed ${replayed} events. `);
    client.emit('resume', replayed);
    ws.heartbeat();
  }
}

/**
 * Emitted whenever a websocket resumes
 * @event Client#resume
 * @param {number} replayed Number of events that were replayed
 */

module.exports = ResumedHandler;
