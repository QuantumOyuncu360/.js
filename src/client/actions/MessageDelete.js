const Action = require('./Action');

class MessageDeleteAction extends Action {

  constructor(client) {
    super(client);
    this.deleted = {};
  }

  handle(data) {
    const client = this.client;

    const channel = client.channels.get(data.channel_id);
    if (channel) {
      let message = channel.messages.get(data.id);

      if (message) {
        channel.messages.delete(message.id);
        this.deleted[channel.id + message.id] = message;
        this.scheduleForDeletion(channel.id, message.id);
      } else if (this.deleted[channel.id + data.id]) {
        message = this.deleted[channel.id + data.id];
      }

      return {
        message,
      };
    }

    return {
      message: null,
    };
  }

  scheduleForDeletion(channelID, messageID) {
    this.client.setTimeout(() => delete this.deleted[channelID + messageID],
      this.client.options.rest_ws_bridge_timeout);
  }
}

module.exports = MessageDeleteAction;
