const Action = require('./Action');
const Constants = require('../../util/Constants');

/*
{ user_id: 'id',
     message_id: 'id',
     emoji: { name: '�', id: null },
     channel_id: 'id' } }
*/

class MessageReactionRemove extends Action {
  handle(data) {
    const user = this.client.users.get(data.user_id);
    if (!user) return false;

    const channel = this.client.channels.get(data.channel_id);
    if (!channel || channel.type === 'voice') return false;

    const message = channel.messages.get(data.message_id);
    if (!message) return false;

    if (!data.emoji) return false;

    const reaction = message._removeReaction(data.emoji, user);

    if (reaction) {
      this.client.emit(Constants.Events.MESSAGE_REACTION_REMOVE, reaction, user);
    }

    return {
      message,
      reaction,
      user,
    };
  }
}

module.exports = MessageReactionRemove;
