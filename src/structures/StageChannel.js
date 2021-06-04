'use strict';

const BaseGuildVoiceChannel = require('./BaseGuildVoiceChannel');
const StageInstanceManager = require('../managers/StageInstanceManager');

/**
 * Represents a guild stage channel on Discord.
 * @extends {BaseGuildVoiceChannel}
 */
class StageChannel extends BaseGuildVoiceChannel {
  _patch(data) {
    super._patch(data);

    if ('topic' in data) {
      /**
       * The topic of the stage channel
       * @type {?string}
       */
      this.topic = data.topic;
    }
  }

  /**
   * A manager for the instances belonging to this stage channel
   * @type {StageInstanceManager}
   * @readonly
   */
  get instances() {
    return new StageInstanceManager(this.client);
  }

  /**
   * Sets the RTC region of the channel.
   * @name StageChannel#setRTCRegion
   * @param {?string} region The new region of the channel. Set to `null` to remove a specific region for the channel
   * @returns {Promise<StageChannel>}
   * @example
   * // Set the RTC region to europe
   * stageChannel.setRTCRegion('europe');
   * @example
   * // Remove a fixed region for this channel - let Discord decide automatically
   * stageChannel.setRTCRegion(null);
   */
}

module.exports = StageChannel;
