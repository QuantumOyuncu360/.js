'use strict';

const Util = require('./util/Util');

module.exports = {
  // "Root" classes (starting points)
  BaseClient: require('./client/BaseClient'),
  Client: require('./client/Client'),
  Shard: require('./sharding/Shard'),
  ShardClientUtil: require('./sharding/ShardClientUtil'),
  ShardingManager: require('./sharding/ShardingManager'),
  WebhookClient: require('./client/WebhookClient'),

  // Utilities
  ActivityFlags: require('./util/ActivityFlags'),
  BitField: require('./util/BitField'),
  Collection: require('./util/Collection'),
  Constants: require('./util/Constants'),
  DataResolver: require('./util/DataResolver'),
  DiscordAPIError: require('./rest/DiscordAPIError'),
  HTTPError: require('./rest/HTTPError'),
  LimitedCollection: require('./util/LimitedCollection'),
  MessageFlags: require('./util/MessageFlags'),
  Permissions: require('./util/Permissions'),
  Snowflake: require('./util/Snowflake'),
  SnowflakeUtil: require('./util/Snowflake'),
  Speaking: require('./util/Speaking'),
  Structures: require('./util/Structures'),
  SystemChannelFlags: require('./util/SystemChannelFlags'),
  Util,
  version: require('../package.json').version,

  // Managers
  BaseManager: require('./managers/BaseManager'),
  ChannelManager: require('./managers/ChannelManager'),
  GuildChannelManager: require('./managers/GuildChannelManager'),
  GuildEmojiManager: require('./managers/GuildEmojiManager'),
  GuildEmojiRoleManager: require('./managers/GuildEmojiRoleManager'),
  GuildMemberManager: require('./managers/GuildMemberManager'),
  GuildMemberRoleManager: require('./managers/GuildMemberRoleManager'),
  GuildManager: require('./managers/GuildManager'),
  MessageManager: require('./managers/MessageManager'),
  PresenceManager: require('./managers/PresenceManager'),
  ReactionUserManager: require('./managers/ReactionUserManager'),
  RoleManager: require('./managers/RoleManager'),
  UserManager: require('./managers/UserManager'),

  // Shortcuts to Util methods
  discordSort: Util.discordSort,
  escapeMarkdown: Util.escapeMarkdown,
  fetchRecommendedShards: Util.fetchRecommendedShards,
  resolveColor: Util.resolveColor,
  resolveString: Util.resolveString,
  splitMessage: Util.splitMessage,

  // Structures
  Activity: require('./structures/Presence').Activity,
  APIMessage: require('./structures/APIMessage'),
  Base: require('./structures/Base'),
  CategoryChannel: require('./structures/CategoryChannel'),
  Channel: require('./structures/Channel'),
  ClientApplication: require('./structures/ClientApplication'),
  ClientPresence: require('./structures/ClientPresence'),
  get ClientUser() {
    // This is a getter so that it properly extends any custom User class
    return require('./structures/ClientUser');
  },
  Collector: require('./structures/interfaces/Collector'),
  DMChannel: require('./structures/DMChannel'),
  Emoji: require('./structures/Emoji'),
  Guild: require('./structures/Guild'),
  GuildAuditLogs: require('./structures/GuildAuditLogs'),
  GuildChannel: require('./structures/GuildChannel'),
  GuildEmoji: require('./structures/GuildEmoji'),
  GuildMember: require('./structures/GuildMember'),
  Integration: require('./structures/Integration'),
  Invite: require('./structures/Invite'),
  Message: require('./structures/Message'),
  MessageAttachment: require('./structures/MessageAttachment'),
  MessageCollector: require('./structures/MessageCollector'),
  MessageEmbed: require('./structures/MessageEmbed'),
  MessageMentions: require('./structures/MessageMentions'),
  MessageReaction: require('./structures/MessageReaction'),
  NewsChannel: require('./structures/NewsChannel'),
  PermissionOverwrites: require('./structures/PermissionOverwrites'),
  Presence: require('./structures/Presence').Presence,
  ReactionCollector: require('./structures/ReactionCollector'),
  ReactionEmoji: require('./structures/ReactionEmoji'),
  RichPresenceAssets: require('./structures/Presence').RichPresenceAssets,
  Role: require('./structures/Role'),
  StoreChannel: require('./structures/StoreChannel'),
  Team: require('./structures/Team'),
  TeamMember: require('./structures/TeamMember'),
  TextChannel: require('./structures/TextChannel'),
  User: require('./structures/User'),
  VoiceChannel: require('./structures/VoiceChannel'),
  VoiceRegion: require('./structures/VoiceRegion'),
  VoiceState: require('./structures/VoiceState'),
  Webhook: require('./structures/Webhook'),

  WebSocket: require('./WebSocket'),
};
