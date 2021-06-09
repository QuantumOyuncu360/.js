'use strict';

const BaseManager = require('./BaseManager');
const { TypeError, Error } = require('../errors');
const StageInstance = require('../structures/StageInstance');
const { PrivacyLevels } = require('../util/Constants');

class StageInstanceManager extends BaseManager {
  constructor(guild, iterable) {
    super(guild.client, iterable, StageInstance);

    /**
     * The guild this manager belongs to
     * @type {Guild}
     */
    this.guild = guild;
  }

  /**
   * The cache of this Manager
   * @type {Collection<Snowflake, StageInstance>}
   * @name StageInstanceManager#cache
   */

  /**
   * Options used to create a stage instance.
   * @typedef {Object} CreateStageInstanceOptions
   * @property {StageChannel|Snowflake} channel The stage channel whose instance is to be created
   * @property {string} topic The topic of the stage instance
   * @property {PrivacyLevel|number} [privacyLevel] The privacy level of the stage instance
   */

  /**
   * Creates a new stage instance.
   * @param {CreateStageInstanceOptions} options The options to create the stage instance
   * @returns {Promise<StageInstance>}
   * @example
   * // Create a stage instance
   * guild.stageInstances.create({
   *  channel: '1234567890123456789',
   *  topic: 'A very creative topic',
   *  privacyLevel: 'GUILD_ONLY'
   * })
   *  .then(s => console.log(s))
   *  .catch(console.error);
   */
  async create(options) {
    if (typeof options !== 'object') throw new TypeError('INVALID_TYPE', 'options', 'object', true);
    let { channel, topic, privacyLevel } = options;
    const channelID = this.guild.channels.resolveID(channel);
    if (!channelID) throw new Error('STAGE_CHANNEL_RESOLVE');

    if (privacyLevel) privacyLevel = typeof privacyLevel === 'number' ? privacyLevel : PrivacyLevels[privacyLevel];

    const data = await this.client.api['stage-instances'].post({
      data: {
        channel_id: channelID,
        topic,
        privacy_level: privacyLevel,
      },
    });

    return this.add(data);
  }

  /**
   * Fetches the stage instance associated with a stage channel, if it exists.
   * @param {StageChannel|Snowflake} channel The stage channel whose instance is to be fetched
   * @param {boolean} [cache=true] Whether or not to cache the fetched stage instance
   * @param {boolean} [force=false] Whether to skip the cache check and request the API
   * @returns {Promise<StageInstance>}
   * @example
   * // Fetch a stage instance
   * guild.stageInstances.fetch('1234567890123456789')
   *  .then(s => console.log(s))
   *  .catch(console.error);
   */
  async fetch(channel, cache = true, force = false) {
    const channelID = this.guild.channels.resolveID(channel);
    if (!channelID) throw new Error('STAGE_CHANNEL_RESOLVE');

    if (!force) {
      const existing = this.cache.find(stageInstance => stageInstance.channelID === channelID);
      if (existing) return existing;
    }

    const data = await this.client.api('stage-instances', channelID).get();
    return this.add(data, cache);
  }

  /**
   * Options used to update an existing stage instance.
   * @typedef {Object} UpdateStageInstanceOptions
   * @property {string} [topic] The new topic of the stage instance
   * @property {PrivacyLevel|number} [privacyLevel] The new privacy level of the stage instance
   */

  /**
   * Updates an existing stage instance.
   * @param {StageChannel|Snowflake} channel The stage channel whose instance is to be updated
   * @param {UpdateStageInstanceOptions} options The options to update the stage instance
   * @returns {Promise<StageInstance>}
   * @example
   * // Update a stage instance
   * guild.stageInstances.update('1234567890123456789', { topic: 'new topic' })
   *  .then(s => console.log(s))
   *  .catch(console.error);
   */
  async update(channel, options) {
    if (typeof options !== 'object') throw new TypeError('INVALID_TYPE', 'options', 'object', true);
    const channelID = this.guild.channels.resolveID(channel);
    if (!channelID) throw new Error('STAGE_CHANNEL_RESOLVE');

    let { topic, privacyLevel } = options;

    if (privacyLevel) privacyLevel = typeof privacyLevel === 'number' ? privacyLevel : PrivacyLevels[privacyLevel];

    const data = await this.client.api('stage-instances', channelID).patch({
      data: {
        topic,
        privacy_level: privacyLevel,
      },
    });

    if (this.cache.has(data.id)) {
      const clone = this.cache.get(data.id)._clone();
      clone._patch(data);
      return clone;
    }

    return this.add(data);
  }

  /**
   * Deletes an existing stage instance.
   * @param {StageChannel|Snowflake} channel The stage channel whose instance is to be deleted
   * @returns {Promise<void>}
   */
  async delete(channel) {
    const channelID = this.guild.channels.resolveID(channel);
    if (!channelID) throw new Error('STAGE_CHANNEL_RESOLVE');

    await this.client.api('stage-instances', channelID).delete();
  }
}

module.exports = StageInstanceManager;
