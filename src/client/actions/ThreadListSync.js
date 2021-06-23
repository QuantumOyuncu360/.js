'use strict';

const Action = require('./Action');
const Collection = require('../../util/Collection');
const { Events } = require('../../util/Constants');

class ThreadListSyncAction extends Action {
  handle(data) {
    const client = this.client;

    const guild = client.guilds.cache.get(data.guild_id);
    if (!guild) return {};

    if (data.channels_ids) {
      for (const id of data.channel_ids) {
        const channel = client.channels.resolve(id);
        if (channel) this.removeStale(channel);
      }
    } else {
      for (const [, channel] of guild.channels.cache) {
        this.removeStale(channel);
      }
    }

    const syncedThreads = data.threads.reduce((coll, rawThread) => {
      const thread = client.channels.add(rawThread);
      return coll.set(thread.id, thread);
    }, new Collection());

    for (const rawMember of Object.values(data.members)) {
      // Discord sends the thread id as id in this object
      const thread = client.channels.cache.get(rawMember.id);
      if (thread) {
        thread.members._add(rawMember);
      }
    }

    /**
     * Emitted whenever the client user gains access to a text or news channel that contains threads
     * @event Client#threadListSync
     * @param {Collection<Snowflake, ThreadChannel>} threads The threads that were synced
     */
    client.emit(Events.THREAD_LIST_SYNC, syncedThreads);

    return {
      syncedThreads,
    };
  }

  removeStale(channel) {
    channel.threads?.cache.forEach(thread => {
      if (!thread.archived) {
        this.client.channels.remove(thread.id);
      }
    });
  }
}

module.exports = ThreadListSyncAction;
