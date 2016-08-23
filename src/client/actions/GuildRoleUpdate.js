const Action = require('./Action');
const Constants = require('../../util/Constants');
const cloneObject = require('../../util/CloneObject');

class GuildRoleUpdateAction extends Action {

  handle(data) {
    const client = this.client;
    const guild = client.guilds.get(data.guild_id);

    const roleData = data.role;

    if (guild) {
      let oldRole;
      const existingRole = guild.roles.get(roleData.id);
      // exists and not the same
      if (existingRole && !existingRole.equals(roleData)) {
        oldRole = cloneObject(existingRole);
        existingRole.setup(data.role);
        client.emit(Constants.Events.GUILD_ROLE_UPDATE, guild, oldRole, existingRole);
      }

      return {
        old: oldRole,
        updated: existingRole,
      };
    }

    return {
      old: null,
      updated: null,
    };
  }
}

/**
* Emitted whenever a guild role is updated.
*
* @event Client#guildRoleUpdated
* @param {Guild} guild the guild that the role was updated in.
* @param {Role} oldRole the role before the update.
* @param {Role} newRole the role after the update.
*/

module.exports = GuildRoleUpdateAction;
