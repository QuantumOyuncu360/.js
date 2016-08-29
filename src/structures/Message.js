const Collection = require('../util/Collection');
const Attachment = require('./MessageAttachment');
const Embed = require('./MessageEmbed');
/**
 * Represents a Message on Discord
 */
class Message {
  constructor(channel, data, client) {
    this._type = 'message';
    /**
     * The channel that the message was sent in
     * @type {Channel}
     */
    this.channel = channel;

    if (channel.guild) {
      /**
       * If the message was sent in a guild, this will be the guild the message was sent in
       * @type {?Guild}
       */
      this.guild = channel.guild;
    }

    /**
     * The client that instantiated the Message
     * @type {Client}
     */
    this.client = client;
    if (data) {
      this.setup(data);
    }
  }

  setup(data) {
    /**
     * Whether or not this message is pinned
     * @type {Boolean}
     */
    this.pinned = data.pinned;
    /**
     * The author of the message
     * @type {User}
     */
    this.author = this.client.dataManager.newUser(data.author);
    /**
     * The content of the message
     * @type {String}
     */
    this.content = data.content;
    /**
     * When the message was sent
     * @type {Date}
     */
    this.timestamp = new Date(data.timestamp);
    /**
     * If the message was edited, the timestamp at which it was last edited
     * @type {?Date}
     */
    this.editedTimestamp = data.edited_timestamp ? new Date(data.edited_timestamp) : null;
    /**
     * Whether or not the message was Text-To-Speech
     * @type {Boolean}
     */
    this.tts = data.tts;
    /**
     * Whether the message mentioned @everyone or not
     * @type {Boolean}
     */
    this.mentionEveryone = data.mention_everyone;
    /**
     * A random number used for checking message delivery
     * @type {String}
     */
    this.nonce = data.nonce;
    /**
     * A list of embeds in the message - e.g. YouTube Player
     * @type {Array<Embed>}
     */
    this.embeds = data.embeds.map(e => new Embed(this, e));
    /**
     * A collection of attachments in the message - e.g. Pictures - mapped by their ID.
     * @type {Collection<String, MessageAttachment>}
     */
    this.attachments = new Collection();
    for (const attachment of data.attachments) {
      this.attachments.set(attachment.id, new Attachment(this, attachment));
    }
    /**
     * An object containing a further users, roles or channels collections
     * @type {Object}
     * @property {Collection<String, User>} mentions.users Mentioned users, maps their ID to the user object.
     * @property {Collection<String, Role>} mentions.roles Mentioned roles, maps their ID to the role object.
     * @property {Collection<String, GuildChannel>}
     * mentions.channels Mentioned channels, maps their ID to the channel object.
     */
    this.mentions = {
      users: new Collection(),
      roles: new Collection(),
      channels: new Collection(),
    };
    /**
     * The ID of the message (unique in the channel it was sent)
     * @type {String}
     */
    this.id = data.id;

    for (const mention of data.mentions) {
      let user = this.client.users.get(mention.id);
      if (user) {
        this.mentions.users.set(user.id, user);
      } else {
        user = this.client.dataManager.newUser(mention);
        this.mentions.users.set(user.id, user);
      }
    }

    if (data.mention_roles) {
      for (const mention of data.mention_roles) {
        const role = this.channel.guild.roles.get(mention);
        if (role) {
          this.mentions.roles.set(role.id, role);
        }
      }
    }

    if (this.channel.guild) {
      const channMentionsRaw = data.content.match(/<#([0-9]{14,20})>/g) || [];
      for (const raw of channMentionsRaw) {
        const chan = this.channel.guild.channels.get(raw.match(/([0-9]{14,20})/g)[0]);
        if (chan) {
          this.mentions.channels.set(chan.id, chan);
        }
      }
    }
  }

  patch(data) {
    if (data.author) {
      this.author = this.client.users.get(data.author.id);
    }
    if (data.content) {
      this.content = data.content;
    }
    if (data.timestamp) {
      this.timestamp = new Date(data.timestamp);
    }
    if (data.edited_timestamp) {
      this.editedTimestamp = data.edited_timestamp ? new Date(data.edited_timestamp) : null;
    }
    if (data.tts) {
      this.tts = data.tts;
    }
    if (data.mention_everyone) {
      this.mentionEveryone = data.mention_everyone;
    }
    if (data.nonce) {
      this.nonce = data.nonce;
    }
    if (data.embeds) {
      this.embeds = data.embeds.map(e => new Embed(this, e));
    }
    if (data.attachments) {
      this.attachments = new Collection();
      for (const attachment of data.attachments) {
        this.attachments.set(attachment.id, new Attachment(this, attachment));
      }
    }
    if (data.mentions) {
      for (const mention of data.mentions) {
        let user = this.client.users.get(mention.id);
        if (user) {
          this.mentions.users.set(user.id, user);
        } else {
          user = this.client.dataManager.newUser(mention);
          this.mentions.users.set(user.id, user);
        }
      }
    }
    if (data.mention_roles) {
      for (const mention of data.mention_roles) {
        const role = this.channel.guild.roles.get(mention);
        if (role) {
          this.mentions.roles.set(role.id, role);
        }
      }
    }
    if (data.id) {
      this.id = data.id;
    }
    if (this.channel.guild && data.content) {
      const channMentionsRaw = data.content.match(/<#([0-9]{14,20})>/g) || [];
      for (const raw of channMentionsRaw) {
        const chan = this.channel.guild.channels.get(raw.match(/([0-9]{14,20})/g)[0]);
        if (chan) {
          this.mentions.channels.set(chan.id, chan);
        }
      }
    }
  }

  /**
   * Used mainly internally. Whether two messages are identical in properties. If you want to compare messages
   * without checking all the properties, use `message.id === message2.id`, which is much more efficient. This
   * method allows you to see if there are differences in content, embeds, attachments, nonce and tts properties.
   * @param {Message} message The message to compare it to
   * @param {Object} rawData Raw data passed through the WebSocket about this message
   * @returns {Boolean}
   */
  equals(message, rawData) {
    const embedUpdate = !message.author && !message.attachments;

    if (embedUpdate) {
      const base = this.id === message.id &&
        this.embeds.length === message.embeds.length;
      return base;
    }
    let base = this.id === message.id &&
        this.author.id === message.author.id &&
        this.content === message.content &&
        this.tts === message.tts &&
        this.nonce === message.nonce &&
        this.embeds.length === message.embeds.length &&
        this.attachments.length === message.attachments.length;

    if (base && rawData) {
      base = this.mentionEveryone === message.mentionEveryone &&
        this.timestamp.getTime() === new Date(rawData.timestamp).getTime() &&
        this.editedTimestamp === new Date(rawData.edited_timestamp).getTime();
    }

    return base;
  }

  /**
   * Deletes the message
   * @param {Number} [timeout=0] How long to wait to delete the message in milliseconds
   * @returns {Promise<Message, Error>}
   * @example
   * // delete a message
   * message.delete()
   *  .then(msg => console.log(`Deleted message from ${msg.author}`))
   *  .catch(console.log);
   */
  delete(timeout = 0) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        this.client.rest.methods.deleteMessage(this)
          .then(resolve)
          .catch(reject);
      }, timeout);
    });
  }

  /**
   * Edit the content of a message
   * @param {String} content the new content of a message
   * @returns {Promise<Message, Error>}
   * @example
   * // update the content of a message
   * message.edit('This is my new content!')
   *  .then(msg => console.log(`Updated the content of a message from ${msg.author}`))
   *  .catch(console.log);
   */
  edit(content) {
    return this.client.rest.methods.updateMessage(this, content);
  }

  /**
   * Reply to a message
   * @param {String} content the content of the message
   * @param {MessageOptions} [options = {}] the options to provide
   * @returns {Promise<Message, Error>}
   * @example
   * // reply to a message
   * message.reply('Hey, I'm a reply!')
   *  .then(msg => console.log(`Sent a reply to ${msg.author}`))
   *  .catch(console.log);
   */
  reply(content, options = {}) {
    const newContent = this.guild ? `${this.author}, ${content}` : content;
    return this.client.rest.methods.sendMessage(this.channel, newContent, options.tts);
  }

  /**
   * Pins this message to the channel's pinned messages
   * @returns {Promise<Message, Error>}
   */
  pin() {
    return this.client.rest.methods.pinMessage(this);
  }

  /**
   * Unpins this message from the channel's pinned messages
   * @returns {Promise<Message, Error>}
   */
  unpin() {
    return this.client.rest.methods.unpinMessage(this);
  }
}

module.exports = Message;
