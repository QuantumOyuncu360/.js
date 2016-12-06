/**
 * Represents a permission overwrite for a role or member in a guild channel.
 */
class PermissionOverwrites {
  constructor(guildChannel, data) {
    /**
     * The GuildChannel this overwrite is for
     * @type {GuildChannel}
     */
    this.channel = guildChannel;

    if (data) this.setup(data);
  }

  setup(data) {
    /**
     * The ID of this overwrite, either a user ID or a role ID
     * @type {string}
     */
    this.id = data.id;

    /**
     * The type of this overwrite
     * @type {string}
     */
    this.type = data.type;

    this.denyData = data.deny;
    this.allowData = data.allow;
  }

  /**
   * Delete this Permission Overwrite.
   * @returns {Promise<PermissionOverwrites>}
   */
  delete() {
    return this.channel.client.rest.methods.deletePermissionOverwrites(this);
  }
}

module.exports = PermissionOverwrites;
