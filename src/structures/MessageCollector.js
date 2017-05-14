const Collector = require('./interfaces/Collector');

/**
 * @typedef {CollectorOptions} MessageCollectorOptions
 * @property {number} max The maximum amount of messages to process
 * @property {number} maxMatches The maximum amount of messages to collect
 */

/**
 * Collects messages on a channel.
 * @extends {Collector}
 */
class MessageCollector extends Collector {

  /**
   * @param {TextChannel|DMChannel|GroupDMChannel} channel The channel
   * @param {CollectorFilter} filter The filter to be applied to this collector
   * @param {MessageCollectorOptions} options The options to be applied to this collector
   * @emits MessageCollector#message
   */
  constructor(channel, filter, options = {}) {
    super(channel.client, filter, options);

    /**
     * @type {TextBasedChannel} channel The channel
     */
    this.channel = channel;

    /**
     * Total number of messages that were received in the channel during message collection
     * @type {number}
     */
    this.received = 0;

    this.client.on('message', this.listener);

    this.on('collect', this._reEmitter);
  }

  /**
   * Handle an incoming message for possible collection.
   * @param {Message} message The message that could be collected
   * @returns {?{key: Snowflake, value: Message}} Message data to collect
   * @private
   */
  handle(message) {
    if (message.channel.id !== this.channel.id) return null;
    this.received++;
    return {
      key: message.id,
      value: message,
    };
  }

  /**
   * Check after collection to see if the collector is done.
   * @returns {?string} Reason to end the collector, if any
   * @private
   */
  postCheck() {
    // Consider changing the end reasons for v12
    if (this.options.maxMatches && this.collected.size >= this.options.max) return 'matchesLimit';
    if (this.options.max && this.received >= this.options.maxProcessed) return 'limit';
    return null;
  }

  /**
   * Removes event listeners.
   * @private
   */
  cleanup() {
    this.removeListener('collect', this._reEmitter);
    this.client.removeListener('message', this.listener);
  }
}

module.exports = MessageCollector;
