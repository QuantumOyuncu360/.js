const EventEmitter = require('events').EventEmitter;
const mergeDefault = require('../util/MergeDefault');
const Constants = require('../util/Constants');
const RESTManager = require('./rest/RESTManager');
const ClientDataManager = require('./ClientDataManager');
const ClientManager = require('./ClientManager');
const ClientDataResolver = require('./ClientDataResolver');
const ClientVoiceManager = require('./voice/ClientVoiceManager');
const WebSocketManager = require('./websocket/WebSocketManager');
const ActionsManager = require('./actions/ActionsManager');
const Collection = require('../util/Collection');

/**
 * The starting point for making a Discord Bot.
 * @extends {EventEmitter}
 */
class Client extends EventEmitter {

  /**
   * Creates an instance of Client.
   * @param {ClientOptions} [options] options to pass to the client
   */
  constructor(options) {
    super();
    this.options = mergeDefault(Constants.DefaultOptions, options);
    /**
     * The REST manager of the client
     * @type {RESTManager}
     * @private
     */
    this.rest = new RESTManager(this);
    /**
     * The data manager of the Client
     * @type {ClientDataManager}
     * @private
     */
    this.dataManager = new ClientDataManager(this);
    /**
     * The manager of the Client
     * @type {ClientManager}
     * @private
     */
    this.manager = new ClientManager(this);
    /**
     * The WebSocket Manager of the Client
     * @type {WebSocketManager}
     * @private
     */
    this.ws = new WebSocketManager(this);
    /**
     * The Data Resolver of the Client
     * @type {ClientDataResolver}
     * @private
     */
    this.resolver = new ClientDataResolver(this);
    /**
     * The Action Manager of the Client
     * @type {ActionsManager}
     * @private
     */
    this.actions = new ActionsManager(this);
    /**
     * The Voice Manager of the Client
     * @type {ClientVoiceManager}
     * @private
     */
    this.voice = new ClientVoiceManager(this);
    /**
     * A Collection of the Client's stored users
     * @type {Collection<String, User>}
     */
    this.users = new Collection();
    /**
     * A Collection of the Client's stored guilds
     * @type {Collection<String, Guild>}
     */
    this.guilds = new Collection();
    /**
     * A Collection of the Client's stored channels
     * @type {Collection<String, Channel>}
     */
    this.channels = new Collection();
    /**
     * The authorization token for the logged in user/bot.
     * @type {?String}
     */
    this.token = null;
    /**
     * The ClientUser representing the logged in Client
     * @type {?ClientUser}
     */
    this.user = null;
    /**
     * The email, if there is one, for the logged in Client
     * @type {?String}
     */
    this.email = null;
    /**
     * The password, if there is one, for the logged in Client
     * @type {?String}
     */
    this.password = null;
    /**
     * The time in milliseconds the Client connected
     * @type {?Number}
     */
    this.readyTime = null;
    this._intervals = [];
    this._timeouts = [];
  }

  /**
   * Logs the client in. If successful, resolves with the account's token. <warn>If you're making a bot, it's
   * much better to use a bot account rather than a user account.
   * Bot accounts have higher rate limits and have access to some features user accounts don't have. User bots
   * that are making a lot of API requests can even be banned.</warn>
   * @param  {String} emailOrToken The email or token used for the account. If it is an email, a password _must_ be
   * provided.
   * @param  {String} [password] The password for the account, only needed if an email was provided.
   * @return {Promise<String>}
   * @example
   * // log the client in using a token
   * const token = 'my token';
   * client.login(token);
   * @example
   * // log the client in using email and password
   * const email = 'user@email.com';
   * const password = 'supersecret123';
   * client.login(email, password);
   */
  login(email, password) {
    if (password) {
      // login with email and password
      return this.rest.methods.loginEmailPassword(email, password);
    }
    // login with token
    return this.rest.methods.loginToken(email);
  }

  /**
   * Destroys the client and logs out. Resolves with null if successful.
   * @returns {Promise<null, Error>}
   */
  destroy() {
    return new Promise((resolve, reject) => {
      this.manager.destroy().then(() => {
        this._intervals.map(i => clearInterval(i));
        this._timeouts.map(t => clearTimeout(t));
        this.token = null;
        this.email = null;
        this.password = null;
        resolve();
      })
      .catch(reject);
    });
  }

  setInterval(...params) {
    this._intervals.push(setInterval(...params));
  }

  setTimeout(...params) {
    this._timeouts.push(setTimeout(...params));
  }

  /**
   * Caches a user, or obtains it from the cache if it's already cached.
   * If the user isn't already cached, it will only be obtainable by OAuth bot accounts.
   * @param {String} id The ID of the user to obtain
   * @return {Promise<User>}
   */
  fetchUser(id) {
    if (this.users.has(id)) return Promise.resolve(this.users.get(id));
    return this.rest.methods.getUser(id);
  }

  /**
   * Returns a Collection, mapping Guild ID to Voice Connections.
   * @readonly
   * @type {Collection<String, VoiceConnection>}
   */
  get voiceConnections() {
    return this.voice.connections;
  }

}

module.exports = Client;
