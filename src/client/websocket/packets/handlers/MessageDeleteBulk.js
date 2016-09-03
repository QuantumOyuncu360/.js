const AbstractHandler = require('./AbstractHandler');

class MessageDeleteBulkHandler extends AbstractHandler {

  handle(packet) {
    const data = packet.d;
    const client = this.packetManager.client;

    client.actions.MessageDeleteBulk.handle(data);
  }

}

/**
* Emitted whenever a messages are deleted in bulk
*
* @event Client#messageDeleteBulk
* @param {Collection<string, Message>} messages The deleted messages, mapped by their ID
*/

module.exports = MessageDeleteBulkHandler;
