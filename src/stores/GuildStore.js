'use strict';

const DataStore = require('./DataStore');
const DataResolver = require('../util/DataResolver');
const { Events } = require('../util/Constants');
const Guild = require('../structures/Guild');
const GuildChannel = require('../structures/GuildChannel');
const GuildMember = require('../structures/GuildMember');
const GuildEmoji = require('../structures/GuildEmoji');
const Role = require('../structures/Role');

/**
 * Stores guilds.
 * @extends {DataStore}
 */
class GuildStore extends DataStore {
  constructor(client, iterable) {
    super(client, iterable, Guild);
  }

  /**
   * Data that resolves to give a Guild object. This can be:
   * * A Guild object
   * * A GuildChannel object
   * * A GuildEmoji object
   * * A Role object
   * * A Snowflake
   * @typedef {Guild|GuildChannel|GuildMember|GuildEmoji|Role|Snowflake} GuildResolvable
   */

  /**
   * Resolves a GuildResolvable to a Guild object.
   * @method resolve
   * @memberof GuildStore
   * @instance
   * @param {GuildResolvable} guild The guild resolvable to identify
   * @returns {?Guild}
   */
  resolve(guild) {
    if (guild instanceof GuildChannel ||
      guild instanceof GuildMember ||
      guild instanceof GuildEmoji ||
      guild instanceof Role) return super.resolve(guild.guild);
    return super.resolve(guild);
  }

  /**
   * Resolves a GuildResolvable to a Guild ID string.
   * @method resolveID
   * @memberof GuildStore
   * @instance
   * @param {GuildResolvable} guild The guild resolvable to identify
   * @returns {?Snowflake}
   */
  resolveID(guild) {
    if (guild instanceof GuildChannel ||
      guild instanceof GuildMember ||
      guild instanceof GuildEmoji ||
      guild instanceof Role) return super.resolveID(guild.guild.id);
    return super.resolveID(guild);
  }

  /**
   * Creates a guild.
   * <warn>This is only available to bots in fewer than 10 guilds.</warn>
   * @param {string} name The name of the guild
   * @param {Object} [options] Options for the creating
   * @param {string} [options.region] The region for the server, defaults to the closest one available
   * @param {BufferResolvable|Base64Resolvable} [options.icon=null] The icon for the guild
   * @returns {Promise<Guild>} The guild that was created
   */
  create(name, { region, icon = null } = {}) {
    if (!icon || (typeof icon === 'string' && icon.startsWith('data:'))) {
      return new Promise((resolve, reject) =>
        this.client.api.guilds.post({ data: { name, region, icon } })
          .then(data => {
            if (this.client.guilds.has(data.id)) return resolve(this.client.guilds.get(data.id));

            const handleGuild = guild => {
              if (guild.id === data.id) {
                this.client.removeListener(Events.GUILD_CREATE, handleGuild);
                this.client.clearTimeout(timeout);
                resolve(guild);
              }
            };
            this.client.on(Events.GUILD_CREATE, handleGuild);

            const timeout = this.client.setTimeout(() => {
              this.client.removeListener(Events.GUILD_CREATE, handleGuild);
              resolve(this.client.guilds.add(data));
            }, 10000);
            return undefined;
          }, reject)
      );
    }

    return DataResolver.resolveImage(icon)
      .then(data => this.create(name, { region, icon: data || null }));
  }
}

module.exports = GuildStore;
