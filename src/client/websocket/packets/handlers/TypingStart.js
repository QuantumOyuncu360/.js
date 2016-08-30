const AbstractHandler = require('./AbstractHandler');
const Constants = require('../../../../util/Constants');

class TypingData {
  constructor(since, lastTimestamp, _timeout) {
    this.since = since;
    this.lastTimestamp = lastTimestamp;
    this._timeout = _timeout;
  }

  resetTimeout(_timeout) {
    clearTimeout(this._timeout);
    this._timeout = _timeout;
  }

  get elapsedTime() {
    return Date.now() - this.since;
  }
}

class TypingStartHandler extends AbstractHandler {

  handle(packet) {
    const data = packet.d;
    const client = this.packetManager.client;
    const channel = client.channels.get(data.channel_id);
    const user = client.users.get(data.user_id);
    const timestamp = new Date(data.timestamp * 1000);

    function tooLate() {
      return client.setTimeout(() => {
        client.emit(Constants.Events.TYPING_STOP, channel, user, channel.typingMap[user.id]);
        delete channel.typingMap[user.id];
      }, 6000);
    }

    if (channel && user) {
      if (channel.typingMap[user.id]) {
        // already typing, renew
        const mapping = channel.typingMap[user.id];
        mapping.lastTimestamp = timestamp;
        mapping.resetTimeout(tooLate());
      } else {
        channel.typingMap[user.id] = new TypingData(timestamp, timestamp, tooLate());
        client.emit(Constants.Events.TYPING_START, channel, user);
      }
    }
  }

}

/**
* Emitted whenever a user starts typing in a channel
*
* @event Client#typingStart
* @param {Channel} channel the channel the user started typing in
* @param {User} user the user that started typing
*/

/**
* Emitted whenever a user stops typing in a channel
*
* @event Client#typingStop
* @param {Channel} channel the channel the user stopped typing in
* @param {User} user the user that stopped typing
*/

module.exports = TypingStartHandler;
