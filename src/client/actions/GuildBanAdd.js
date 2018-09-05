const Action = require('./Action');
const GuildBan = require('../../structures/GuildBan');
const { Events } = require('../../util/Constants');

class GuildBanAdd extends Action {
  handle(data) {
    const client = this.client;
    const guild = client.guilds.get(data.guild_id);
    const user = client.users.add(data.user);
    if (guild && user) {
      guild.bans.add(new GuildBan(guild, { user }, false));
      client.emit(Events.GUILD_BAN_ADD, guild, user);
    }
  }
}

module.exports = GuildBanAdd;
