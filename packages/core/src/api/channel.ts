/* eslint-disable jsdoc/check-param-names */
import { makeURLSearchParams, type REST, type RawFile } from '@discordjs/rest';
import {
	Routes,
	type RESTDeleteAPIChannelResult,
	type RESTGetAPIChannelInvitesResult,
	type RESTGetAPIChannelMessageResult,
	type RESTGetAPIChannelMessagesResult,
	type RESTGetAPIChannelPinsResult,
	type RESTGetAPIChannelResult,
	type RESTPatchAPIChannelResult,
	type RESTPostAPIChannelFollowersResult,
	type RESTPostAPIChannelInviteResult,
	type RESTPostAPIChannelMessageCrosspostResult,
	type RESTGetAPIChannelUsersThreadsArchivedResult,
	type RESTPatchAPIChannelJSONBody,
	type RESTPostAPIChannelInviteJSONBody,
	type RESTGetAPIChannelMessagesQuery,
	type RESTGetAPIChannelThreadsArchivedQuery,
	type RESTPostAPIChannelMessageJSONBody,
	type Snowflake,
	type RESTPostAPIChannelMessageResult,
} from 'discord-api-types/v10';

export class ChannelsAPI {
	public constructor(private readonly rest: REST) {}

	/**
	 * Sends a message in a channel
	 *
	 * @param channelId - The id of the channel to send the message in
	 * @param message - The options to use when sending the message
	 */
	public async send(
		channelId: Snowflake,
		{ files, ...body }: RESTPostAPIChannelMessageJSONBody & { files?: RawFile[] },
	) {
		return this.rest.post(Routes.channelMessages(channelId), {
			files,
			body,
		}) as Promise<RESTPostAPIChannelMessageResult>;
	}

	/**
	 * Fetches a channel
	 *
	 * @param channelId - The id of the channel
	 */
	public async get(channelId: Snowflake) {
		return this.rest.get(Routes.channel(channelId)) as Promise<RESTGetAPIChannelResult>;
	}

	/**
	 * Edits a channel
	 *
	 * @param channelId - The id of the channel to edit
	 * @param channel - The new channel data
	 */
	public async edit(channelId: Snowflake, channel: RESTPatchAPIChannelJSONBody) {
		return this.rest.patch(Routes.channel(channelId), { body: channel }) as Promise<RESTPatchAPIChannelResult>;
	}

	/**
	 * Deletes a channel
	 *
	 * @param channelId - The id of the channel to delete
	 */
	public async delete(channelId: Snowflake) {
		return this.rest.delete(Routes.channel(channelId)) as Promise<RESTDeleteAPIChannelResult>;
	}

	/**
	 * Fetches the messages of a channel
	 *
	 * @param channelId - The id of the channel to fetch messages from
	 * @param options - The options to use when fetching messages
	 */
	public async getMessages(channelId: Snowflake, options: RESTGetAPIChannelMessagesQuery = {}) {
		return this.rest.get(Routes.channelMessages(channelId), {
			query: makeURLSearchParams(options as Record<string, unknown>),
		}) as Promise<RESTGetAPIChannelMessagesResult>;
	}

	/**
	 * Shows a typing indicator in a channel
	 *
	 * @param channelId - The id of the channel to show the typing indicator in
	 */
	public async showTyping(channelId: Snowflake) {
		await this.rest.post(Routes.channelTyping(channelId));
	}

	/**
	 * Fetches the pinned messages of a channel
	 *
	 * @param channelId - The id of the channel to fetch pinned messages from
	 */
	public async getPins(channelId: Snowflake) {
		return this.rest.get(Routes.channelPins(channelId)) as Promise<RESTGetAPIChannelPinsResult>;
	}

	/**
	 * Pins a message in a channel
	 *
	 * @param channelId - The id of the channel to pin the message in
	 * @param messageId - The id of the message to pin
	 * @param reason - The reason for pinning the message
	 */
	public async pinMessage(channelId: Snowflake, messageId: Snowflake, reason?: string) {
		await this.rest.put(Routes.channelPin(channelId, messageId), { reason });
	}

	/**
	 * Deletes a message
	 *
	 * @param channelId - The id of the channel the message is in
	 * @param messageId - The id of the message to delete
	 * @param reason - The reason for deleting the message
	 */
	public async deleteMessage(channelId: Snowflake, messageId: Snowflake, reason?: string) {
		await this.rest.delete(Routes.channelMessage(channelId, messageId), { reason });
	}

	/**
	 * Bulk deletes messages
	 *
	 * @param channelId - The id of the channel the messages are in
	 * @param messageIds - The ids of the messages to delete
	 */
	public async bulkDeleteMessages(channelId: Snowflake, messageIds: Snowflake[], reason?: string): Promise<void> {
		await this.rest.post(Routes.channelBulkDelete(channelId), { reason, body: { messages: messageIds } });
	}

	/**
	 * Fetches a message
	 *
	 * @param channelId - The id of the channel the message is in
	 * @param messageId - The id of the message to fetch
	 */
	public async getMessage(channelId: Snowflake, messageId: Snowflake) {
		return this.rest.get(Routes.channelMessage(channelId, messageId)) as Promise<RESTGetAPIChannelMessageResult>;
	}

	/**
	 * Crossposts a message
	 *
	 * @param channelId - The id of the channel the message is in
	 * @param messageId - The id of the message to crosspost
	 */
	public async crosspostMessage(channelId: Snowflake, messageId: Snowflake) {
		return this.rest.post(
			Routes.channelMessageCrosspost(channelId, messageId),
		) as Promise<RESTPostAPIChannelMessageCrosspostResult>;
	}

	/**
	 * Unpins a message in a channel
	 *
	 * @param channelId - The id of the channel to unpin the message in
	 * @param messageId - The id of the message to unpin
	 * @param reason - The reason for unpinning the message
	 */
	public async unpinMessage(channelId: Snowflake, messageId: Snowflake, reason?: string) {
		await this.rest.delete(Routes.channelPin(channelId, messageId), { reason });
	}

	/**
	 * Follows an announcement channel
	 *
	 * @param channelId - The id of the announcement channel to follow
	 * @param webhookChannelId - The id of the webhook channel to follow the announcements in
	 */
	public async followAnnouncements(channelId: Snowflake, webhookChannelId: Snowflake) {
		return this.rest.post(Routes.channelFollowers(channelId), {
			body: { webhook_channel_id: webhookChannelId },
		}) as Promise<RESTPostAPIChannelFollowersResult>;
	}

	/**
	 * Creates a new invite for a channel
	 *
	 * @param channelId - The id of the channel to create an invite for
	 * @param options - The options to use when creating the invite
	 */
	public async createInvite(channelId: Snowflake, options: RESTPostAPIChannelInviteJSONBody, reason?: string) {
		return this.rest.post(Routes.channelInvites(channelId), {
			reason,
			body: options,
		}) as Promise<RESTPostAPIChannelInviteResult>;
	}

	/**
	 * Fetches the invites of a channel
	 *
	 * @param channelId - The id of the channel to fetch invites from
	 */
	public async getInvites(channelId: Snowflake) {
		return this.rest.get(Routes.channelInvites(channelId)) as Promise<RESTGetAPIChannelInvitesResult>;
	}

	/**
	 * Fetches the archived threads of a channel
	 *
	 * @param channelId - The id of the channel to fetch archived threads from
	 * @param archivedStatus - The archived status of the threads to fetch
	 * @param options - The options to use when fetching archived threads
	 */
	public async getArchivedThreads(
		channelId: Snowflake,
		archivedStatus: 'private' | 'public',
		options: RESTGetAPIChannelThreadsArchivedQuery = {},
	) {
		return this.rest.get(Routes.channelThreads(channelId, archivedStatus), {
			query: makeURLSearchParams(options as Record<string, unknown>),
		}) as Promise<RESTGetAPIChannelUsersThreadsArchivedResult>;
	}

	/**
	 * Fetches the private joined archived threads of a channel
	 *
	 * @param channelId - The id of the channel to fetch joined archived threads from
	 * @param options - The options to use when fetching joined archived threads
	 */
	public async getJoinedPrivateArchivedThreads(
		channelId: Snowflake,
		options: RESTGetAPIChannelThreadsArchivedQuery = {},
	) {
		return this.rest.get(Routes.channelJoinedArchivedThreads(channelId), {
			query: makeURLSearchParams(options as Record<string, unknown>),
		}) as Promise<RESTGetAPIChannelUsersThreadsArchivedResult>;
	}
}
