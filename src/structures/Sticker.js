'use strict';

const Base = require('./Base');
const { StickerFormatTypes, StickerTypes } = require('../util/Constants');
const SnowflakeUtil = require('../util/SnowflakeUtil');

/**
 * Represents a Sticker.
 * @extends {Base}
 */
class Sticker extends Base {
  /**
   * @param {Client} client The instantiating client
   * @param {Object} sticker The data for the sticker
   */
  constructor(client, sticker) {
    super(client);

    this._patch(sticker);
  }

  _patch(sticker) {
    /**
     * The ID of the sticker
     * @type {Snowflake}
     */
    this.id = sticker.id;

    /**
     * The description of the sticker
     * @type {?string}
     */
    this.description = sticker.description ?? null;

    /**
     * The type of the sticker
     * @type {?StickerType}
     */
    this.type = StickerTypes[sticker.type] ?? null;

    /**
     * The format of the sticker
     * @type {StickerFormatType}
     */
    this.format = StickerFormatTypes[sticker.format_type];

    /**
     * The name of the sticker
     * @type {string}
     */
    this.name = sticker.name;

    /**
     * The ID of the pack the sticker is from, for standard stickers
     * @type {?Snowflake}
     */
    this.packID = sticker.pack_id ?? null;

    /**
     * An array of tags for the sticker
     * @type {?string[]}
     */
    this.tags = sticker.tags?.split(', ') ?? null;

    /**
     * Whether or not the guild sticker is available
     * @type {?boolean}
     */
    this.available = sticker.available ?? null;

    /**
     * The ID of the guild that owns this sticker
     * @type {?Snowflake}
     */
    this.guildID = sticker.guild_id ?? null;

    /**
     * The user that uploaded the guild sticker
     * @type {?User}
     */
    this.user = sticker.user ? this.client.users.add(sticker.user) : null;

    /**
     * The standard sticker's sort order within its pack
     * @type {?number}
     */
    this.sortValue = sticker.sort_value ?? null;
  }

  /**
   * The timestamp the sticker was created at
   * @type {number}
   * @readonly
   */
  get createdTimestamp() {
    return SnowflakeUtil.deconstruct(this.id).timestamp;
  }

  /**
   * The time the sticker was created at
   * @type {Date}
   * @readonly
   */
  get createdAt() {
    return new Date(this.createdTimestamp);
  }

  /**
   * Whether this sticker is partial
   * @type {boolean}
   * @readonly
   */
  get partial() {
    return !this.type;
  }

  /**
   * The guild that owns this sticker
   * @type {?Guild}
   * @readonly
   */
  get guild() {
    return this.client.guilds.resolve(this.guildID);
  }

  /**
   * A link to the sticker
   * <info>If the sticker's format is LOTTIE, it returns the URL of the Lottie json file.</info>
   * @type {string}
   */
  get url() {
    return this.client.rest.cdn.Sticker(this.id, this.format);
  }

  /**
   * Fetches this sticker.
   * @returns {Promise<Sticker>}
   */
  async fetch() {
    const data = await this.client.api.stickers(this.id).get();
    this._patch(data);
    return this;
  }

  /**
   * Fetches the pack this sticker is part of from Discord, if this is a Nitro sticker.
   * @returns {Promise<?StickerPack>}
   */
  async fetchPack() {
    return (this.packID && (await this.client.fetchPremiumStickerPacks()).get(this.packID)) ?? null;
  }

  /**
   * Fetches the user who uploaded this sticker, if this is a guild sticker.
   * @returns {Promise<?User>}
   */
  async fetchUser() {
    if (this.partial) await this.fetch();
    if (!this.guildID) throw new Error('NOT_GUILD_STICKER');

    const data = await this.client.api.guilds(this.guildID).stickers(this.id).get();
    this._patch(data);
    return this.user;
  }
}

module.exports = Sticker;
