const DataStore = require('./DataStore');
const Role = require('../structures/Role');
/**
 * Stores roles.
 * @private
 * @extends {DataStore}
 */
class RoleStore extends DataStore {
  constructor(guild, iterable) {
    super(guild.client, iterable);
    this.guild = guild;
    Object.defineProperty(this, 'holds', { value: Role });
  }
}

module.exports = RoleStore;
