/* eslint-disable jsdoc/check-param-names */
import type { RawFile, REST } from '@discordjs/rest';
import { makeURLSearchParams } from '@discordjs/rest';
import type {
	APIMessage,
	APIWebhook,
	RESTPatchAPIWebhookJSONBody,
	RESTPatchAPIWebhookWithTokenMessageJSONBody,
	RESTPostAPIChannelWebhookJSONBody,
	RESTPostAPIWebhookWithTokenGitHubQuery,
	RESTPostAPIWebhookWithTokenJSONBody,
	RESTPostAPIWebhookWithTokenQuery,
	RESTPostAPIWebhookWithTokenSlackQuery,
} from 'discord-api-types/v10';
import { Routes } from 'discord-api-types/v10';

export class WebhooksAPI {
	private readonly rest: REST;

	public constructor(rest: REST) {
		this.rest = rest;
	}

	/**
	 * Fetches a webhook
	 *
	 * @param id - The id of the webhook
	 * @param token - The token of the webhook
	 */
	public async get(id: string, token?: string) {
		return this.rest.get(Routes.webhook(id, token));
	}

	/**
	 * Creates a new webhook
	 *
	 * @param channelId - The id of the channel to create the webhook in
	 * @param options - The options to use when creating the webhook
	 * @param reason - The reason for creating the webhook
	 */
	public async create(channelId: string, options: RESTPostAPIChannelWebhookJSONBody, reason?: string) {
		return (await this.rest.post(Routes.channelWebhooks(channelId), {
			reason,
			body: options,
		})) as APIWebhook;
	}

	/**
	 * Edits a webhook
	 *
	 * @param id - The id of the webhook to edit
	 * @param webhook - The new webhook data
	 * @param token - The token of the webhook
	 * @param reason - The reason for editing the webhook
	 */
	public async edit(id: string, webhook: RESTPatchAPIWebhookJSONBody, token?: string, reason?: string) {
		return (await this.rest.patch(Routes.webhook(id, token), {
			reason,
			body: webhook,
		})) as APIWebhook;
	}

	/**
	 * Deletes a webhook
	 *
	 * @param id - The id of the webhook to delete
	 * @param token - The token of the webhook
	 * @param reason - The reason for deleting the webhook
	 */
	public async delete(id: string, token?: string, reason?: string) {
		return this.rest.delete(Routes.webhook(id, token), { reason });
	}

	/**
	 * Executes a webhook
	 *
	 * @param id - The id of the webhook
	 * @param token - The token of the webhook
	 * @param options - The options to use when executing the webhook
	 */
	public async execute(
		id: string,
		token: string,
		options: RESTPostAPIWebhookWithTokenJSONBody & RESTPostAPIWebhookWithTokenQuery & { files?: RawFile[] } = {},
	) {
		const { wait, thread_id, files, ...body } = options;
		return this.rest.post(Routes.webhook(id, token), {
			query: makeURLSearchParams({ wait, thread_id }),
			files,
			body,
		});
	}

	/**
	 * Executes a slack webhook
	 *
	 * @param id - The id of the webhook
	 * @param token - The token of the webhook
	 * @param options - The options to use when executing the webhook
	 */
	public async executeSlack(id: string, token: string, options: RESTPostAPIWebhookWithTokenSlackQuery = {}) {
		return this.rest.post(Routes.webhookPlatform(id, token, 'slack'), {
			query: makeURLSearchParams(options as Record<string, unknown>),
			body: options,
		});
	}

	/**
	 * Executes a github webhook
	 *
	 * @param id - The id of the webhook
	 * @param token - The token of the webhook
	 * @param options - The options to use when executing the webhook
	 * @returns
	 */
	public async executeGitHub(id: string, token: string, options: RESTPostAPIWebhookWithTokenGitHubQuery = {}) {
		return this.rest.post(Routes.webhookPlatform(id, token, 'github'), {
			query: makeURLSearchParams(options as Record<string, unknown>),
			body: options,
		});
	}

	/**
	 * Fetches an associated message from a webhook
	 *
	 * @param id - The id of the webhook
	 * @param token - The token of the webhook
	 * @param messageId - The id of the message to fetch
	 * @param options - The options to use when fetching the message
	 */
	public async getMessage(id: string, token: string, messageId: string, options: { thread_id?: string } = {}) {
		return (await this.rest.get(Routes.webhookMessage(id, token, messageId), {
			query: makeURLSearchParams(options as Record<string, unknown>),
		})) as APIMessage;
	}

	/**
	 * Edits an associated message from a webhook
	 *
	 * @param id - The id of the webhook
	 * @param token - The token of the webhook
	 * @param messageId - The id of the message to edit
	 * @param options - The options to use when editing the message
	 */
	public async editMessage(
		id: string,
		token: string,
		messageId: string,
		options: RESTPatchAPIWebhookWithTokenMessageJSONBody & { thread_id?: string } = {},
	) {
		const { thread_id, ...body } = options;
		return (await this.rest.patch(Routes.webhookMessage(id, token, messageId), {
			query: makeURLSearchParams({ thread_id }),
			body,
		})) as APIMessage;
	}

	/**
	 * Deletes an associated message from a webhook
	 *
	 * @param id - The id of the webhook
	 * @param token - The token of the webhook
	 * @param messageId - The id of the message to delete
	 * @param options - The options to use when deleting the message
	 * @returns
	 */
	public async deleteMessage(id: string, token: string, messageId: string, options: { thread_id?: string } = {}) {
		await this.rest.delete(Routes.webhookMessage(id, token, messageId), {
			query: makeURLSearchParams(options as Record<string, unknown>),
		});
	}
}
