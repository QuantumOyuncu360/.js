'use strict';

const { Collection } = require('@discordjs/collection');
const Base = require('./Base');
const { PollAnswer } = require('./PollAnswer');
const { DiscordjsError } = require('../errors/DJSError');
const { ErrorCodes } = require('../errors/index');

/**
 * Represents a Poll
 * @extends {Base}
 */
class Poll extends Base {
  constructor(client, data, message, channel) {
    super(client);

    /**
     * The id of the channel that this poll is in
     * @type {Snowflake}
     */
    this.channelId = data.channel_id;

    /**
     * The channel that this poll is in
     * @name Poll#channel
     * @type {TextBasedChannel}
     * @readonly
     */

    Object.defineProperty(this, 'channel', { value: channel });

    /**
     * The id of the message that started this poll
     * @type {Snowflake}
     */
    this.messageId = data.message_id;

    /**
     * The message that started this poll
     * @name Poll#message
     * @type {Message}
     * @readonly
     */

    Object.defineProperty(this, 'message', { value: message });

    /**
     * The media for a poll's question
     * @typedef {Object} PollQuestionMedia
     * @property {?string} text The text of this question
     */

    /**
     * The media for this poll's question
     * @type {PollQuestionMedia}
     */
    this.question = {
      text: data.question.text ?? null,
    };

    /**
     * The timestamp when this poll expires
     * @type {?number}
     */
    this.expiresTimestamp = data.expiry && Date.parse(data.expiry);

    /**
     * Whether this poll allows multiple answers
     * @type {boolean}
     */
    this.allowMultiselect = data.allow_multiselect;

    /**
     * The layout type of this poll
     * @type {PollLayoutType}
     */
    this.layoutType = data.layout_type;

    /**
     * Whether this poll is a partial
     * @name Poll#_partial
     * @type {boolean}
     * @private
     */
    Object.defineProperty(this, '_partial', { value: data.partial ?? false });

    this._patch(data);
  }

  _patch(data) {
    if (data.results) {
      /**
       * Whether this poll's results have been precisely counted
       * @type {boolean}
       */
      this.resultsFinalized = data.results.is_finalized;

      for (const answerResult of data.results.answer_counts) {
        const answer = this.answers.get(answerResult.id);
        answer?._patch(answerResult);
      }
    } else {
      this.resultsFinalized ??= false;
    }

    if (data.question) {
      this.question = {
        text: data.question.text,
      };
    }

    if (data.answers) {
      /**
       * The answers of this poll
       * @type {Collection<number, PollAnswer|PartialPollAnswer>}
       */
      this.answers ??= new Collection();

      for (const answer of data.answers) {
        const existing = this.answers.get(answer.answer_id);
        if (existing) {
          existing._patch(answer);
        } else {
          this.answers.set(answer.answer_id, new PollAnswer(this.client, answer, this));
        }
      }
    }
  }

  /**
   * The date when this poll expires
   * @type {?Date}
   * @readonly
   */
  get expiresAt() {
    return this.expiresTimestamp && new Date(this.expiresTimestamp);
  }

  /**
   * Whether this poll is a partial
   * @type {boolean}
   * @readonly
   */
  get partial() {
    return typeof this.layoutType !== 'number' || typeof this.allowMultiselect !== 'boolean';
  }

  /**
   * Fetches the message that started this poll, then updates the poll from the fetched message.
   * @returns {Promise<Poll>}
   */
  async fetch() {
    await this.channel.messages.fetch(this.messageId);

    return this;
  }

  /**
   * Ends this poll.
   * @returns {Promise<Message>}
   */
  end() {
    if (Date.now() > this.expiresTimestamp) {
      return Promise.reject(new DiscordjsError(ErrorCodes.PollAlreadyExpired));
    }

    return this.channel.messages.endPoll(this.messageId);
  }
}

exports.Poll = Poll;
