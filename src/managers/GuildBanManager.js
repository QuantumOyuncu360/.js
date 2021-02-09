'use strict';

const BaseManager = require('./BaseManager');
const GuildBan = require('../structures/GuildBan');
const GuildMember = require('../structures/GuildMember');
const Collection = require('../util/Collection');

/**
 * Manages API methods for Guilds bans and stores their cache.
 * @extends {BaseManager}
 */
class GuildBanManager extends BaseManager {
  constructor(guild, iterable) {
    super(guild.client, iterable, GuildBan);

    /**
     * The guild this Manager belongs to
     * @type {Guild}
     */
    this.guild = guild;
  }

  /**
   * The cache of this Manager
   * @type {Collection<Snowflake, GuildBan>}
   * @name GuildBanManager#cache
   */

  add(data, cache) {
    return super.add(data, cache, { id: data.user.id, extras: [this.guild] });
  }

  /**
   * Data that resolves to give a GuildBan object. This can be:
   * * A GuildBan object
   * * A User resolvable
   * @typedef {GuildBan|UserResolvable} GuildBanResolvable
   */

  /**
   * Resolves a GuildBanResolvable to a GuildBan object.
   * @param {GuildBanResolvable} ban The ban that is in the guild
   * @returns {?GuildBan}
   */
  resolve(ban) {
    return super.resolve(ban) ?? super.resolve(this.client.users.resolveID(ban));
  }

  /**
   * Options used to fetch a single ban from a guild.
   * @typedef {Object} FetchBanOptions
   * @property {UserResolvable} user The ban to fetch
   * @property {boolean} [cache=true] Whether or not to cache the fetched ban
   * @property {boolean} [force=false] Whether to skip the cache check and request the API
   */

  /**
   * Fetches ban(s) from Discord.
   * @param {UserResolvable|FetchBanOptions} [options] If provided fetches a single ban.
   * If undefined, fetches all bans.
   * @returns {Promise<GuildBan>|Promise<Collection<Snowflake, GuildBan>>}
   * @example
   * // Fetch all bans from a guild
   * guild.bans.fetch()
   *   .then(console.log)
   *   .catch(console.error);
   * @example
   * // Fetch a single ban
   * guild.bans.fetch('351871113346809860')
   *   .then(console.log)
   *   .catch(console.error);
   * @example
   * // Fetch a single ban without checking cache
   * guild.bans.fetch({ user, force: true })
   *   .then(console.log)
   *   .catch(console.error)
   * @example
   * // Fetch a single ban without caching
   * guild.bans.fetch({ user, cache: false })
   *   .then(console.log)
   *   .catch(console.error);
   */
  fetch(options) {
    if (!options) return this._fetchMany();
    const user = this.client.users.resolveID(options);
    if (user) return this._fetchSingle({ user, cache: true });
    if (options.user) {
      options.user = this.client.users.resolveID(options.user);
    }
    if (!options.user) {
      if ('cache' in options) return this._fetchMany(options.cache);
      return Promise.reject(new Error('FETCH_BAN_RESOLVE_ID'));
    }
    return this._fetchSingle(options);
  }

  async _fetchSingle({ user, cache, force = false }) {
    if (!force) {
      const existing = this.cache.get(user);
      if (existing && !existing.partial) return existing;
    }

    const data = await this.client.api.guilds(this.guild.id).bans(user).get();
    return this.add(data, cache);
  }

  async _fetchMany(cache) {
    const data = await this.client.api.guilds(this.guild.id).bans.get();
    return data.reduce((col, ban) => col.set(ban.user.id, this.add(ban, cache)), new Collection());
  }

  /**
   * Bans a user from the guild.
   * @param {UserResolvable} user The user to ban
   * @param {Object} [options] Options for the ban
   * @param {number} [options.days=0] Number of days of messages to delete, must be between 0 and 7
   * @param {string} [options.reason] Reason for banning
   * @returns {Promise<GuildMember|User|Snowflake>} Result object will be resolved as specifically as possible.
   * If the GuildMember cannot be resolved, the User will instead be attempted to be resolved. If that also cannot
   * be resolved, the user ID will be the result.
   * @example
   * // Ban a user by ID (or with a user/guild member object)
   * guild.bans.ban('84484653687267328')
   *   .then(user => console.log(`Banned ${user.username || user.id || user} from ${guild.name}`))
   *   .catch(console.error);
   */
  async ban(user, options = { days: 0 }) {
    if (typeof options !== 'object') throw new TypeError('INVALID_TYPE', 'options', 'object', true);
    if (options.days) options.delete_message_days = options.days;
    const id = this.client.users.resolveID(user);
    if (!id) throw new Error('BAN_RESOLVE_ID', true);
    await this.client.api.guilds(this.guild.id).bans[id].put({ data: options });
    if (user instanceof GuildMember) return user;
    const _user = this.client.users.resolve(id);
    if (_user) {
      const member = this.resolve(_user);
      return member || _user;
    }
    return id;
  }

  /**
   * Unbans a user from the guild.
   * @param {UserResolvable} user The user to unban
   * @param {string} [reason] Reason for unbanning user
   * @returns {Promise<User>}
   * @example
   * // Unban a user by ID (or with a user/guild member object)
   * guild.bans.unban('84484653687267328')
   *   .then(user => console.log(`Unbanned ${user.username} from ${guild.name}`))
   *   .catch(console.error);
   */
  async unban(user, reason) {
    const id = this.client.users.resolveID(user);
    if (!id) throw new Error('BAN_RESOLVE_ID');
    await this.client.api.guilds(this.guild.id).bans[id].delete({ reason });
    return this.client.users.resolve(user);
  }
}

module.exports = GuildBanManager;
