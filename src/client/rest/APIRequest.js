const fetcher = require('node-fetcher');
const Constants = require('../../util/Constants');

class APIRequest {
  constructor(rest, method, url, auth, data, files) {
    this.rest = rest;
    this.method = method;
    this.url = url;
    this.auth = auth;
    this.data = data;
    this.files = files;
    this.route = this.getRoute(this.url);
  }

  getRoute(url) {
    let route = url.split('?')[0];
    if (route.includes('/channels/') || route.includes('/guilds/')) {
      const startInd = route.includes('/channels/') ? route.indexOf('/channels/') : route.indexOf('/guilds/');
      const majorID = route.substring(startInd).split('/')[2];
      route = route.replace(/(\d{8,})/g, ':id').replace(':id', majorID);
    }
    return route;
  }

  getAuth() {
    if (this.rest.client.token && this.rest.client.user && this.rest.client.user.bot) {
      return `Bot ${this.rest.client.token}`;
    } else if (this.rest.client.token) {
      return this.rest.client.token;
    }
    throw new Error(Constants.Errors.NO_TOKEN);
  }

  gen() {
    const request = fetcher[this.method](this.url);
    if (this.auth) request.set('Authorization', this.getAuth());
    if (!this.rest.client.browser) request.set('User-Agent', this.rest.userAgentManager.userAgent);
    if (this.files) {
      for (const file of this.files) if (file && file.file) request.attach(file.name, file.file, file.name);
      if (typeof this.data !== 'undefined') request.attach('payload_json', JSON.stringify(this.data));
    } else if (this.data) {
      request.send(this.data);
    }
    return request;
  }
}

module.exports = APIRequest;
