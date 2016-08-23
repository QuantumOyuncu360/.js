const AbstractHandler = require('./AbstractHandler');
const Constants = require('../../../../util/Constants');

class MessageCreateHandler extends AbstractHandler {

  handle(packet) {
    const data = packet.d;
    const client = this.packetManager.client;

    const response = client.actions.MessageCreate.handle(data);

    if (response.m) {
      client.emit(Constants.Events.MESSAGE_CREATE, response.m);
    }
  }

}

/**
* Emitted whenever a message is created
*
* @event Client#message
* @param {Message} message The created message
*/

module.exports = MessageCreateHandler;
