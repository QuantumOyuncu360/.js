import { makeURLSearchParams, type REST } from '@discordjs/rest';
import {
	Routes,
	type RESTGetAPIGuildMemberResult,
	type RESTGetAPIGuildMembersSearchResult,
	type RESTPatchAPIGuildMemberJSONBody,
	type RESTPatchAPIGuildMemberResult,
	type Snowflake,
} from 'discord-api-types/v10';

export class GuildMembersAPI {
	public constructor(private readonly rest: REST) {}

	/**
	 * Fetches a guild member
	 *
	 * @param guildId - The id of the guild
	 * @param userId - The id of the user
	 */
	public async get(guildId: Snowflake, userId: Snowflake) {
		return this.rest.get(Routes.guildMember(guildId, userId)) as Promise<RESTGetAPIGuildMemberResult>;
	}

	/**
	 * Searches for guild members
	 *
	 * @param guildId - The id of the guild to search in
	 * @param query - The query to search for
	 * @param limit - The maximum number of members to return
	 */
	public async search(guildId: Snowflake, query: string, limit: number = 1) {
		return this.rest.get(Routes.guildMembersSearch(guildId), {
			query: makeURLSearchParams({ query, limit }),
		}) as Promise<RESTGetAPIGuildMembersSearchResult>;
	}

	/**
	 * Edits a guild member
	 *
	 * @param guildId - The id of the guild
	 * @param userId - The id of the user
	 * @param options - The options to use when editing the guild member
	 * @param reason - The reason for editing this guild member
	 */
	public async edit(
		guildId: Snowflake,
		userId: Snowflake,
		options: RESTPatchAPIGuildMemberJSONBody = {},
		reason?: string,
	) {
		return this.rest.patch(Routes.guildMember(guildId, userId), {
			reason,
			body: options,
		}) as Promise<RESTPatchAPIGuildMemberResult>;
	}

	/**
	 * Adds a role to a guild member
	 *
	 * @param guildId - The id of the guild
	 * @param userId - The id of the user
	 * @param roleId - The id of the role
	 * @param reason - The reason for adding this role to the guild member
	 */
	public async addRole(guildId: Snowflake, userId: Snowflake, roleId: Snowflake, reason?: string) {
		await this.rest.put(Routes.guildMemberRole(guildId, userId, roleId), { reason });
	}

	/**
	 * Removes a role from a guild member
	 *
	 * @param guildId - The id of the guild
	 * @param userId - The id of the user
	 * @param roleId - The id of the role
	 * @param reason - The reason for removing this role from the guild member
	 */
	public async removeRole(guildId: Snowflake, userId: Snowflake, roleId: Snowflake, reason?: string) {
		await this.rest.delete(Routes.guildMemberRole(guildId, userId, roleId), { reason });
	}
}
