'use strict';

const Emoji = require('./Emoji');

/**
 * Parent class for `GuildEmoji` and `GuildPreviewEmoji`.
 * @extends {Emoji}
 */
class BaseEmoji extends Emoji {
  /**
   * @param {Client} client The instantiating client
   * @param {Object} data The data for the emoji
   * @param {Guild} guild The guild the emoji is a part of
   */
  constructor(client, data, guild) {
    super(client, data);

    /**
     * The guild this emoji is a part of
     * @type {Guild}
     */
    this.guild = guild;

    /**
     * The ID of this emoji
     * @type {Snowflake}
     * @name BaseEmoji#id
     */

    this._patch(data);
  }
}

module.exports = BaseEmoji;
