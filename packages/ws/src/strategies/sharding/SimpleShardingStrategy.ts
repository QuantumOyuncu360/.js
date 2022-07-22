import { Collection } from '@discordjs/collection';
import type { GatewaySendPayload } from 'discord-api-types/v10';
import type { IShardingStrategy } from './IShardingStrategy';
import { IdentifyThrottler } from '../../utils/IdentifyThrottler';
import { bindShardEvents } from '../../utils/utils';
import type { WebSocketManager } from '../../ws/WebSocketManager';
import { WebSocketShard, WebSocketShardDestroyOptions } from '../../ws/WebSocketShard';
import { managerToFetchingStrategyOptions } from '../context/IContextFetchingStrategy';
import { SimpleContextFetchingStrategy } from '../context/SimpleContextFetchingStrategy';

/**
 * Simple strategy that just spawns shards in the current process
 */
export class SimpleShardingStrategy implements IShardingStrategy {
	private readonly manager: WebSocketManager;
	private readonly shards = new Collection<number, WebSocketShard>();

	private readonly throttler: IdentifyThrottler;

	public constructor(manager: WebSocketManager) {
		this.manager = manager;
		this.throttler = new IdentifyThrottler(manager);
	}

	public async spawn(shardIds: number[]) {
		await this.destroy({ reason: 'User is adjusting their shards' });
		for (const shardId of shardIds) {
			// the manager purposefully implements IContextFetchingStrategy to avoid another class here
			const strategy = new SimpleContextFetchingStrategy(
				this.manager,
				await managerToFetchingStrategyOptions(this.manager),
			);
			const shard = new WebSocketShard(strategy, shardId);
			bindShardEvents(this.manager, shard, shardId);
			this.shards.set(shardId, shard);
		}
	}

	public async connect() {
		const promises = [];

		for (const shard of this.shards.values()) {
			await this.throttler.waitForIdentify();
			promises.push(shard.connect());
		}

		await Promise.all(promises);
	}

	public async destroy(options?: WebSocketShardDestroyOptions) {
		const promises = [];

		for (const shard of this.shards.values()) {
			if (options?.recover !== undefined) {
				await this.throttler.waitForIdentify();
			}
			promises.push(shard.destroy(options));
		}

		await Promise.all(promises);
		this.shards.clear();
	}

	public send(shardId: number, payload: GatewaySendPayload) {
		const shard = this.shards.get(shardId);
		if (!shard) throw new Error(`Shard ${shardId} not found`);
		return shard.send(payload);
	}
}
