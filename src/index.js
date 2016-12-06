try {
  global.EventEmitter = require('eventemitter3');
} catch (err) {
  global.EventEmitter = require('events').EventEmitter;
}

module.exports = {
  Client: require('./client/Client'),
  WebhookClient: require('./client/WebhookClient'),
  Shard: require('./sharding/Shard'),
  ShardClientUtil: require('./sharding/ShardClientUtil'),
  ShardingManager: require('./sharding/ShardingManager'),

  Collection: require('./util/Collection'),
  splitMessage: require('./util/SplitMessage'),
  escapeMarkdown: require('./util/EscapeMarkdown'),
  fetchRecommendedShards: require('./util/FetchRecommendedShards'),

  Channel: require('./structures/Channel'),
  ClientOAuth2Application: require('./structures/ClientOAuth2Application'),
  ClientUser: require('./structures/ClientUser'),
  DMChannel: require('./structures/DMChannel'),
  Emoji: require('./structures/Emoji'),
  EvaluatedPermissions: require('./structures/EvaluatedPermissions'),
  Game: require('./structures/Presence').Game,
  GroupDMChannel: require('./structures/GroupDMChannel'),
  Guild: require('./structures/Guild'),
  GuildChannel: require('./structures/GuildChannel'),
  GuildMember: require('./structures/GuildMember'),
  Invite: require('./structures/Invite'),
  Message: require('./structures/Message'),
  MessageAttachment: require('./structures/MessageAttachment'),
  MessageCollector: require('./structures/MessageCollector'),
  MessageEmbed: require('./structures/MessageEmbed'),
  MessageReaction: require('./structures/MessageReaction'),
  OAuth2Application: require('./structures/OAuth2Application'),
  PartialGuild: require('./structures/PartialGuild'),
  PartialGuildChannel: require('./structures/PartialGuildChannel'),
  PermissionOverwrites: require('./structures/PermissionOverwrites'),
  Presence: require('./structures/Presence').Presence,
  ReactionEmoji: require('./structures/ReactionEmoji'),
  RichEmbed: require('./structures/RichEmbed'),
  Role: require('./structures/Role'),
  TextChannel: require('./structures/TextChannel'),
  User: require('./structures/User'),
  VoiceChannel: require('./structures/VoiceChannel'),
  Webhook: require('./structures/Webhook'),

  version: require('../package').version,
  Constants: require('./util/Constants'),
};

if (typeof window !== 'undefined') window.Discord = module.exports; // eslint-disable-line no-undef
