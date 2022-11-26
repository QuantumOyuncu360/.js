import { makeURLSearchParams, type REST } from '@discordjs/rest';
import {
	Routes,
	type APIChannel,
	type APIFollowedChannel,
	type APIInvite,
	type APIMessage,
	type RESTGetAPIChannelUsersThreadsArchivedResult,
	type RESTPatchAPIChannelJSONBody,
	type RESTPostAPIChannelInviteJSONBody,
	type RESTGetAPIChannelMessagesQuery,
	type RESTGetAPIChannelThreadsArchivedQuery,
} from 'discord-api-types/v10';

export class ChannelsAPI {
	public constructor(private readonly rest: REST) {}

	/**
	 * Fetches a channel
	 *
	 * @param channelId - The id of the channel
	 */
	public async get(channelId: string) {
		return (await this.rest.get(Routes.channel(channelId))) as APIChannel;
	}

	/**
	 * Edits a channel
	 *
	 * @param channelId - The id of the channel to edit
	 * @param channel - The new channel data
	 */
	public async edit(channelId: string, channel: RESTPatchAPIChannelJSONBody) {
		return (await this.rest.patch(Routes.channel(channelId), {
			body: channel,
		})) as APIChannel;
	}

	/**
	 * Deletes a channel
	 *
	 * @param channelId - The id of the channel to delete
	 */
	public async delete(channelId: string) {
		return (await this.rest.delete(Routes.channel(channelId))) as APIChannel;
	}

	/**
	 * Fetches the messages of a channel
	 *
	 * @param channelId - The id of the channel to fetch messages from
	 * @param options - The options to use when fetching messages
	 */
	public async getMessages(channelId: string, options: RESTGetAPIChannelMessagesQuery = {}) {
		return (await this.rest.get(Routes.channelMessages(channelId), {
			query: makeURLSearchParams(options as Record<string, unknown>),
		})) as APIMessage[];
	}

	/**
	 * Shows a typing indicator in a channel
	 *
	 * @param channelId - The id of the channel to show the typing indicator in
	 */
	public async showTyping(channelId: string) {
		await this.rest.post(Routes.channelTyping(channelId));
	}

	/**
	 * Fetches the pinned messages of a channel
	 *
	 * @param channelId - The id of the channel to fetch pinned messages from
	 */
	public async getPins(channelId: string) {
		return (await this.rest.get(Routes.channelPins(channelId))) as APIMessage[];
	}

	/**
	 * Pins a message in a channel
	 *
	 * @param channelId - The id of the channel to pin the message in
	 * @param messageId - The id of the message to pin
	 */
	public async pin(channelId: string, messageId: string) {
		await this.rest.put(Routes.channelPin(channelId, messageId));
	}

	/**
	 * Unpins a message in a channel
	 *
	 * @param channelId - The id of the channel to unpin the message in
	 * @param messageId - The id of the message to unpin
	 */
	public async unpin(channelId: string, messageId: string) {
		await this.rest.delete(Routes.channelPin(channelId, messageId));
	}

	/**
	 * Follows an announcement channel
	 *
	 * @param channelId - The id of the announcement channel to follow
	 * @param webhookChannelId - The id of the webhook channel to follow the announcements in
	 */
	public async followAnnouncements(channelId: string, webhookChannelId: string) {
		return (await this.rest.post(Routes.channelFollowers(channelId), {
			body: {
				webhook_channel_id: webhookChannelId,
			},
		})) as APIFollowedChannel;
	}

	/**
	 * Creates a new invite for a channel
	 *
	 * @param channelId - The id of the channel to create an invite for
	 * @param options - The options to use when creating the invite
	 */
	public async createInvite(channelId: string, options: RESTPostAPIChannelInviteJSONBody) {
		return (await this.rest.post(Routes.channelInvites(channelId), {
			body: options,
		})) as APIInvite;
	}

	/**
	 * Fetches the invites of a channel
	 *
	 * @param channelId - The id of the channel to fetch invites from
	 */
	public async getInvites(channelId: string) {
		return (await this.rest.get(Routes.channelInvites(channelId))) as APIInvite[];
	}

	/**
	 * Fetches the archived threads of a channel
	 *
	 * @param channelId - The id of the channel to fetch archived threads from
	 * @param archivedStatus - The archived status of the threads to fetch
	 * @param options - The options to use when fetching archived threads
	 */
	public async getArchivedThreads(
		channelId: string,
		archivedStatus: 'private' | 'public',
		options: RESTGetAPIChannelThreadsArchivedQuery = {},
	) {
		return (await this.rest.get(Routes.channelThreads(channelId, archivedStatus), {
			query: makeURLSearchParams(options as Record<string, unknown>),
		})) as RESTGetAPIChannelUsersThreadsArchivedResult;
	}

	/**
	 * Fetches the private joined archived threads of a channel
	 *
	 * @param channelId - The id of the channel to fetch joined archived threads from
	 * @param options - The options to use when fetching joined archived threads
	 */
	public async getJoinedPrivateArchivedThreads(channelId: string, options: RESTGetAPIChannelThreadsArchivedQuery = {}) {
		return (await this.rest.get(Routes.channelJoinedArchivedThreads(channelId), {
			query: makeURLSearchParams(options as Record<string, unknown>),
		})) as RESTGetAPIChannelUsersThreadsArchivedResult;
	}
}
