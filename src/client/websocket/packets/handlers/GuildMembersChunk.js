// ##untested##

const AbstractHandler = require('./AbstractHandler');
const Constants = require('../../../../util/Constants');

class GuildMembersChunkHandler extends AbstractHandler {

  handle(packet) {
    const data = packet.d;
    const client = this.packetManager.client;
    const guild = client.guilds.get(data.guild_id);
    const members = [];

    if (guild) {
      for (const member of data.members) {
        members.push(guild._addMember(member, true));
      }
    }

    guild._checkChunks();
    client.emit(Constants.Events.GUILD_MEMBERS_CHUNK, guild, members);
  }

}

/**
* Emitted whenever a chunk of Guild members is received
*
* @event Client#guildMembersChunk
* @param {Guild} guild The guild that the chunks relate to
* @param {Array<GuildMember>} members The members in the chunk
*/

module.exports = GuildMembersChunkHandler;
