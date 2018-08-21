const DiscordAPIError = require('./DiscordAPIError');
const HTTPError = require('./HTTPError');
const Util = require('../util/Util');
const { Events: { RATE_LIMIT }, browser } = require('../util/Constants');

function parseResponse(res) {
  if (res.headers.get('content-type').startsWith('application/json')) return res.json();
  if (browser) return res.blob();
  return res.buffer();
}

function getAPIOffset(serverDate) {
  return new Date(serverDate).getTime() - Date.now();
}

function calculateReset(reset, serverDate) {
  return new Date(Number(reset) * 1000).getTime() - getAPIOffset(serverDate);
}

class RequestHandler {
  constructor(manager) {
    this.manager = manager;
    this.busy = false;
    this.queue = [];
    this.reset = -1;
    this.remaining = -1;
    this.limit = -1;
    this.retryAfter = -1;
  }

  push(request) {
    if (this.busy) {
      this.queue.push(request);
      return this.run();
    } else {
      return this.execute(request);
    }
  }

  run() {
    if (this.queue.length === 0) return Promise.resolve();
    return this.execute(this.queue.shift());
  }

  get limited() {
    return (this.manager.globallyRateLimited || this.remaining <= 0) && Date.now() < this.reset;
  }

  get _inactive() {
    return this.queue.length === 0 && !this.limited && this.busy !== true;
  }

  /* eslint-disable-next-line complexity */
  async execute(item) {
    // Insert item back to the beginning if currently busy
    if (this.busy) {
      this.queue.unshift(item);
      return null;
    }

    this.busy = true;
    const { reject, request, resolve } = item;

    // After calculations and requests have been done, pre-emptively stop further requests
    if (this.limited) {
      const timeout = this.reset + this.manager.client.options.restTimeOffset - Date.now();

      if (this.manager.client.listenerCount(RATE_LIMIT)) {
        /**
         * Emitted when the client hits a rate limit while making a request
         * @event Client#rateLimit
         * @param {Object} rateLimitInfo Object containing the rate limit info
         * @param {number} rateLimitInfo.timeout Timeout in ms
         * @param {number} rateLimitInfo.limit Number of requests that can be made to this endpoint
         * @param {string} rateLimitInfo.method HTTP method used for request that triggered this event
         * @param {string} rateLimitInfo.path Path used for request that triggered this event
         * @param {string} rateLimitInfo.route Route used for request that triggered this event
         */
        this.manager.client.emit(RATE_LIMIT, {
          timeout,
          limit: this.limit,
          method: request.method,
          path: request.path,
          route: request.route,
        });
      }

      if (this.manager.globallyRateLimited && !this.manager.globalTimeout) {
        // Set a global rate limit for all of the handlers instead of each one individually
        this.manager.globalTimeout = this.manager.client.setTimeout(() => {
          this.manager.globalTimeout = null;
          this.manager.globallyRateLimited = false;
          this.busy = false;
          this.run();
        }, timeout);
      } else if (this.manager.globalTimeout) {
        // Already waiting for a global rate limit to clear
        this.queue.unshift(item);
        return null;
      } else {
        // Wait for the timeout to expire in order to avoid an actual 429
        await Util.delayFor(timeout);
      }
    }

    // Perform the request
    let res;
    try {
      res = await request.make();
    } catch (error) {
      // NodeFetch error expected for all "operational" errors, such as 500 status code
      this.busy = false;
      return reject(
        new HTTPError(error.message, error.constructor.name, error.status, request.method, request.route)
      );
    }

    if (res && res.headers) {
      if (res.headers.get('x-ratelimit-global')) this.manager.globallyRateLimited = true;

      const serverDate = res.headers.get('date');
      const limit = res.headers.get('x-ratelimit-limit');
      const remaining = res.headers.get('x-ratelimit-remaining');
      const reset = res.headers.get('x-ratelimit-reset');
      const retryAfter = res.headers.get('retry-after');

      this.limit = limit ? Number(limit) : Infinity;
      this.remaining = remaining ? Number(remaining) : 1;
      this.reset = reset ? calculateReset(reset, serverDate) : Date.now();
      this.retryAfter = retryAfter ? Number(retryAfter) : -1;

      // https://github.com/discordapp/discord-api-docs/issues/182
      if (item.request.route.includes('reactions')) {
        this.reset = Date.now() + getAPIOffset(serverDate) + 250;
      }
    }

    // Finished handling headers, safe to unlock manager
    this.busy = false;

    if (res.ok) {
      const success = await parseResponse(res);
      // Nothing wrong with the request, proceed with the next
      resolve(success);
      return this.run();
    } else if (res.status === 429) {
      // A ratelimit was hit - this should never happen
      this.queue.unshift(item);
      this.manager.client.emit('debug', `429 hit on route ${item.request.route}`);
      await Util.delayFor(this.retryAfter);
      return this.run();
    } else if (res.status >= 500 && res.status < 600) {
      // Retry once for possible serverside issues
      if (item.retried) {
        return reject(
          new HTTPError(res.statusText, res.constructor.name, res.status, item.request.method, request.route)
        );
      } else {
        item.retried = true;
        this.queue.unshift(item);
        return this.run();
      }
    } else {
      // Handle possible malformed requessts
      try {
        const data = await parseResponse(res);
        if (res.status >= 400 && res.status < 500) {
          return reject(new DiscordAPIError(request.path, data, request.method));
        }
        return null;
      } catch (err) {
        return reject(
          new HTTPError(err.message, err.constructor.name, err.status, request.method, request.route)
        );
      }
    }
  }
}

module.exports = RequestHandler;
