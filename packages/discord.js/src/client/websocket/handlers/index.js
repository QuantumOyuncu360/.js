'use strict';

const handlers = Object.fromEntries([
  ['APPLICATION_COMMAND_PERMISSIONS_UPDATE', require('./APPLICATION_COMMAND_PERMISSIONS_UPDATE')],
  ['AUTO_MODERATION_ACTION_EXECUTION', require('./AUTO_MODERATION_ACTION_EXECUTION')],
  ['AUTO_MODERATION_RULE_CREATE', require('./AUTO_MODERATION_RULE_CREATE')],
  ['AUTO_MODERATION_RULE_DELETE', require('./AUTO_MODERATION_RULE_DELETE')],
  ['AUTO_MODERATION_RULE_UPDATE', require('./AUTO_MODERATION_RULE_UPDATE')],
  ['CHANNEL_CREATE', require('./CHANNEL_CREATE')],
  ['CHANNEL_DELETE', require('./CHANNEL_DELETE')],
  ['CHANNEL_PINS_UPDATE', require('./CHANNEL_PINS_UPDATE')],
  ['CHANNEL_UPDATE', require('./CHANNEL_UPDATE')],
  ['GUILD_AUDIT_LOG_ENTRY_CREATE', require('./GUILD_AUDIT_LOG_ENTRY_CREATE')],
  ['GUILD_BAN_ADD', require('./GUILD_BAN_ADD')],
  ['GUILD_BAN_REMOVE', require('./GUILD_BAN_REMOVE')],
  ['GUILD_CREATE', require('./GUILD_CREATE')],
  ['GUILD_DELETE', require('./GUILD_DELETE')],
  ['GUILD_EMOJIS_UPDATE', require('./GUILD_EMOJIS_UPDATE')],
  ['GUILD_INTEGRATIONS_UPDATE', require('./GUILD_INTEGRATIONS_UPDATE')],
  ['GUILD_MEMBERS_CHUNK', require('./GUILD_MEMBERS_CHUNK')],
  ['GUILD_MEMBER_ADD', require('./GUILD_MEMBER_ADD')],
  ['GUILD_MEMBER_REMOVE', require('./GUILD_MEMBER_REMOVE')],
  ['GUILD_MEMBER_UPDATE', require('./GUILD_MEMBER_UPDATE')],
  ['GUILD_ROLE_CREATE', require('./GUILD_ROLE_CREATE')],
  ['GUILD_ROLE_DELETE', require('./GUILD_ROLE_DELETE')],
  ['GUILD_ROLE_UPDATE', require('./GUILD_ROLE_UPDATE')],
  ['GUILD_SCHEDULED_EVENT_CREATE', require('./GUILD_SCHEDULED_EVENT_CREATE')],
  ['GUILD_SCHEDULED_EVENT_DELETE', require('./GUILD_SCHEDULED_EVENT_DELETE')],
  ['GUILD_SCHEDULED_EVENT_UPDATE', require('./GUILD_SCHEDULED_EVENT_UPDATE')],
  ['GUILD_SCHEDULED_EVENT_USER_ADD', require('./GUILD_SCHEDULED_EVENT_USER_ADD')],
  ['GUILD_SCHEDULED_EVENT_USER_REMOVE', require('./GUILD_SCHEDULED_EVENT_USER_REMOVE')],
  ['GUILD_STICKERS_UPDATE', require('./GUILD_STICKERS_UPDATE')],
  ['GUILD_UPDATE', require('./GUILD_UPDATE')],
  ['INTERACTION_CREATE', require('./INTERACTION_CREATE')],
  ['INVITE_CREATE', require('./INVITE_CREATE')],
  ['INVITE_DELETE', require('./INVITE_DELETE')],
  ['MESSAGE_CREATE', require('./MESSAGE_CREATE')],
  ['MESSAGE_DELETE', require('./MESSAGE_DELETE')],
  ['MESSAGE_DELETE_BULK', require('./MESSAGE_DELETE_BULK')],
  ['MESSAGE_REACTION_ADD', require('./MESSAGE_REACTION_ADD')],
  ['MESSAGE_REACTION_REMOVE', require('./MESSAGE_REACTION_REMOVE')],
  ['MESSAGE_REACTION_REMOVE_ALL', require('./MESSAGE_REACTION_REMOVE_ALL')],
  ['MESSAGE_REACTION_REMOVE_EMOJI', require('./MESSAGE_REACTION_REMOVE_EMOJI')],
  ['MESSAGE_UPDATE', require('./MESSAGE_UPDATE')],
  ['PRESENCE_UPDATE', require('./PRESENCE_UPDATE')],
  ['READY', require('./READY')],
  ['RESUMED', require('./RESUMED')],
  ['STAGE_INSTANCE_CREATE', require('./STAGE_INSTANCE_CREATE')],
  ['STAGE_INSTANCE_DELETE', require('./STAGE_INSTANCE_DELETE')],
  ['STAGE_INSTANCE_UPDATE', require('./STAGE_INSTANCE_UPDATE')],
  ['THREAD_CREATE', require('./THREAD_CREATE')],
  ['THREAD_DELETE', require('./THREAD_DELETE')],
  ['THREAD_LIST_SYNC', require('./THREAD_LIST_SYNC')],
  ['THREAD_MEMBERS_UPDATE', require('./THREAD_MEMBERS_UPDATE')],
  ['THREAD_MEMBER_UPDATE', require('./THREAD_MEMBER_UPDATE')],
  ['THREAD_UPDATE', require('./THREAD_UPDATE')],
  ['TYPING_START', require('./TYPING_START')],
  ['USER_UPDATE', require('./USER_UPDATE')],
  ['VOICE_CHANNEL_EFFECT_SEND', require('./VOICE_CHANNEL_EFFECT_SEND')],
  ['VOICE_SERVER_UPDATE', require('./VOICE_SERVER_UPDATE')],
  ['VOICE_STATE_UPDATE', require('./VOICE_STATE_UPDATE')],
  ['WEBHOOKS_UPDATE', require('./WEBHOOKS_UPDATE')],
]);

module.exports = handlers;
