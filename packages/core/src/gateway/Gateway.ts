import type { Awaitable } from '@discordjs/util';
import type { ManagerShardEventsMap, WebSocketShardEvents } from '@discordjs/ws';
import type { GatewaySendPayload } from 'discord-api-types/v10';

/**
 * A Discord gateway-like interface that can be used to send & receive events.
 */
export interface Gateway {
	getShardCount(): Awaitable<number>;
	on(
		event: WebSocketShardEvents.Dispatch,
		listener: (...params: ManagerShardEventsMap[WebSocketShardEvents.Dispatch]) => Awaitable<void>,
	): this;
	/**
	 * Sends a payload to the specified shard
	 */
	send(shardId: number, payload: GatewaySendPayload): Awaitable<void>;
}
