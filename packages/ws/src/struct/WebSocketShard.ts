import { once } from 'node:events';
import { setTimeout } from 'node:timers';
import { setTimeout as sleep } from 'node:timers/promises';
import { TextDecoder } from 'node:util';
import { inflate } from 'node:zlib';
import { AsyncQueue } from '@sapphire/async-queue';
import { AsyncEventEmitter } from '@vladfrangu/async_event_emitter';
import {
	GatewayDispatchEvents,
	GatewayIdentifyData,
	GatewayOpcodes,
	GatewayReceivePayload,
	GatewaySendPayload,
} from 'discord-api-types/v10';
import { CONNECTING, OPEN, RawData, WebSocket } from 'ws';
import type { Inflate } from 'zlib-sync';
import type { SessionInfo } from './WebSocketManager';
import type { IContextFetchingStrategy } from '../strategies/context/IContextFetchingStrategy';
import { ImportantGatewayOpcodes } from '../utils/constants';
import { lazy } from '../utils/utils';

const getZlibSync = lazy(() => import('zlib-sync').then((mod) => mod.default).catch(() => null));

export enum WebSocketShardEvents {
	Debug = 'debug',
	Hello = 'hello',
	Ready = 'ready',
	Resumed = 'resumed',
}

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export type WebSocketShardEventsMap = {
	[WebSocketShardEvents.Debug]: [payload: { message: string }];
	[WebSocketShardEvents.Hello]: [];
	[WebSocketShardEvents.Ready]: [];
};

export enum WebSocketShardStatus {
	Idle,
	Connecting,
	Resuming,
	Ready,
}

export enum WebSocketShardDestroyRecovery {
	Reconnect,
	Resume,
}

export interface WebSocketShardDestroyOptions {
	reason: string;
	code?: number;
	recover?: WebSocketShardDestroyRecovery;
}

export class WebSocketShard extends AsyncEventEmitter<WebSocketShardEventsMap> {
	private connection: WebSocket | null = null;

	private readonly strategy: IContextFetchingStrategy;
	private readonly id: number;

	private useIdentifyCompress = false;

	private inflate: Inflate | null = null;
	private readonly textDecoder = new TextDecoder();

	private status: WebSocketShardStatus = WebSocketShardStatus.Idle;

	private replayedEvents = 0;

	private isAck = true;

	private sendRateLimitState = {
		remaining: 120,
		resetAt: Date.now(),
	};

	private heartbeatInterval: NodeJS.Timer | null = null;
	private lastHeartbeatAt = -1;

	private session: SessionInfo | null = null;

	private readonly sendQueue = new AsyncQueue();

	public constructor(strategy: IContextFetchingStrategy, id: number) {
		super();
		this.strategy = strategy;
		this.id = id;
	}

	public async connect() {
		if (this.status !== WebSocketShardStatus.Idle) {
			throw new Error("Tried to connect a shard that wasn't idle");
		}

		const data = await this.strategy.fetchGatewayInformation();

		const { version, encoding, compression } = this.strategy.options;
		const params = new URLSearchParams({ v: version, encoding });
		if (compression) {
			const zlib = await getZlibSync();
			if (zlib) {
				params.append('compress', compression);
				this.inflate = new zlib.Inflate({
					chunkSize: 65535,
					to: 'string',
				});
			} else if (!this.useIdentifyCompress) {
				this.useIdentifyCompress = true;
				console.warn(
					'WebSocketShard: Compression is enabled but zlib-sync is not installed, falling back to identify compress',
				);
			}
		}

		this.status = WebSocketShardStatus.Idle;

		const url = `${data.url}?${params.toString()}`;
		this.debug([`Connecting to ${url}`]);
		const connection = new WebSocket(url)
			// eslint-disable-next-line @typescript-eslint/no-misused-promises
			.on('message', this.onMessage.bind(this))
			.on('error', this.onError.bind(this))
			.on('close', this.onClose.bind(this));

		connection.binaryType = 'arraybuffer';
		this.connection = connection;

		await this.waitForEvent(WebSocketShardEvents.Hello, this.strategy.options.helloTimeout);

		const session = await this.strategy.retrieveSessionInfo(this.id);
		if (session?.shardCount === (await this.strategy.getShardCount())) {
			await this.resume(session);
		} else {
			await this.identify();
		}
	}

	public async destroy(options: WebSocketShardDestroyOptions) {
		if (this.status === WebSocketShardStatus.Idle) {
			throw new Error('Tried to destroy a shard that was idle');
		}

		if (!options.code) {
			options.code = options.recover === WebSocketShardDestroyRecovery.Resume ? 4200 : 1000;
		}

		this.debug([
			'Destroying shard',
			`Reason: ${options.reason}`,
			`Code: ${options.code}`,
			`Recover: ${options.recover === undefined ? 'none' : WebSocketShardDestroyRecovery[options.recover]!}`,
		]);

		// Reset state
		this.isAck = true;
		if (this.heartbeatInterval) {
			clearInterval(this.heartbeatInterval);
		}
		this.lastHeartbeatAt = -1;

		// Clear session state if applicable
		if (options.recover !== WebSocketShardDestroyRecovery.Resume && this.session) {
			this.session = null;
			await this.strategy.updateSessionInfo(this.id, null);
		}

		if (this.connection && (this.connection.readyState === OPEN || this.connection.readyState === CONNECTING)) {
			this.connection.close(options.code, options.reason);
		}
	}

	private async waitForEvent(event: WebSocketShardEvents, timeoutDuration?: number | null) {
		this.debug([`Waiting for event ${event} for ${timeoutDuration ? `${timeoutDuration}ms` : 'indefinitely'}`]);
		const controller = new AbortController();
		const timeout = timeoutDuration ? setTimeout(() => controller.abort(), timeoutDuration).unref() : null;
		await once(this, event, { signal: controller.signal });
		if (timeout) {
			clearTimeout(timeout);
		}
	}

	public async send(payload: GatewaySendPayload) {
		if (!this.connection) {
			throw new Error("WebSocketShard wasn't connected");
		}

		if (this.status !== WebSocketShardStatus.Ready && !ImportantGatewayOpcodes.has(payload.op)) {
			throw new Error('Tried to send a message before the shard was ready');
		}

		await this.sendQueue.wait();

		if (--this.sendRateLimitState.remaining <= 0) {
			if (this.sendRateLimitState.resetAt < Date.now()) {
				await sleep(Date.now() - this.sendRateLimitState.resetAt);
			}

			this.sendRateLimitState = {
				remaining: 119,
				resetAt: Date.now() + 60_000,
			};
		}

		this.sendQueue.shift();
		this.connection.send(JSON.stringify(payload));
	}

	// TODO(DD): deal with identify limits
	private async identify() {
		this.debug(['Identifying']);
		const d: GatewayIdentifyData = {
			token: this.strategy.options.token,
			properties: this.strategy.options.identifyProperties,
			intents: this.strategy.options.intents,
			compress: this.useIdentifyCompress,
			shard: [this.id, await this.strategy.getShardCount()],
		};

		if (this.strategy.options.largeThreshold) {
			d.large_threshold = this.strategy.options.largeThreshold;
		}

		if (this.strategy.options.initialPresence) {
			d.presence = this.strategy.options.initialPresence;
		}

		await this.send({
			op: GatewayOpcodes.Identify,
			d,
		});

		await this.waitForEvent(WebSocketShardEvents.Ready, this.strategy.options.readyTimeout);
		this.status = WebSocketShardStatus.Ready;
	}

	private resume(session: SessionInfo) {
		this.debug(['Resuming session']);
		this.status = WebSocketShardStatus.Resuming;
		this.replayedEvents = 0;
		return this.send({
			op: GatewayOpcodes.Resume,
			d: {
				token: this.strategy.options.token,
				seq: session.sequence,
				session_id: session.sessionId,
			},
		});
	}

	private async heartbeat(requested = false) {
		if (!this.isAck && !requested) {
			return this.destroy({ reason: 'Zombie connection', recover: WebSocketShardDestroyRecovery.Resume });
		}

		await this.send({
			op: GatewayOpcodes.Heartbeat,
			d: this.session?.sequence ?? null,
		});

		this.lastHeartbeatAt = Date.now();
		this.isAck = false;
	}

	private async unpackMessage(data: Buffer | ArrayBuffer, isBinary: boolean): Promise<GatewayReceivePayload | null> {
		const decompressable = new Uint8Array(data);

		// Deal with no compression
		if (!isBinary) {
			return JSON.parse(this.textDecoder.decode(decompressable)) as GatewayReceivePayload;
		}

		// Deal with identify compress
		if (this.useIdentifyCompress) {
			return new Promise((resolve, reject) => {
				inflate(decompressable, { chunkSize: 65535 }, (err, result) => {
					if (err) {
						return reject(err);
					}

					resolve(JSON.parse(this.textDecoder.decode(result)) as GatewayReceivePayload);
				});
			});
		}

		// Deal with gw wide zlib-stream compression
		if (this.inflate) {
			const l = decompressable.length;
			const flush =
				l >= 4 &&
				decompressable[l - 4] === 0x00 &&
				decompressable[l - 3] === 0x00 &&
				decompressable[l - 2] === 0xff &&
				decompressable[l - 1] === 0xff;

			const zlib = await getZlibSync();
			this.inflate.push(Buffer.from(decompressable), flush ? zlib!.Z_SYNC_FLUSH : zlib!.Z_NO_FLUSH);

			if (this.inflate.err) {
				this.emit('error', `${this.inflate.err}${this.inflate.msg ? `: ${this.inflate.msg}` : ''}`);
			}

			if (!flush) {
				return null;
			}

			const { result } = this.inflate;
			if (!result) {
				return null;
			}

			return JSON.parse(typeof result === 'string' ? result : this.textDecoder.decode(result)) as GatewayReceivePayload;
		}

		// TODO(DD): Consider throwing?
		return null;
	}

	private async onMessage(data: RawData, isBinary: boolean) {
		const payload = await this.unpackMessage(data as Buffer | ArrayBuffer, isBinary);
		if (!payload) {
			return;
		}

		switch (payload.op) {
			case GatewayOpcodes.Dispatch: {
				if (this.status === WebSocketShardStatus.Resuming) {
					this.replayedEvents++;
				}

				switch (payload.t) {
					case GatewayDispatchEvents.Ready: {
						this.emit(WebSocketShardEvents.Ready);

						this.session ??= {
							sequence: payload.s,
							sessionId: payload.d.session_id,
							shardId: this.id,
							shardCount: await this.strategy.getShardCount(),
						};

						await this.strategy.updateSessionInfo(this.id, this.session);
						break;
					}

					case GatewayDispatchEvents.Resumed: {
						this.status = WebSocketShardStatus.Ready;
						this.debug([`Resumed and replayed ${this.replayedEvents} events`]);
						break;
					}

					default: {
						break;
					}
				}

				if (this.session) {
					if (payload.s > this.session.sequence) {
						this.session.sequence = payload.s;
						await this.strategy.updateSessionInfo(this.id, this.session);
					}
				}

				break;
			}

			case GatewayOpcodes.Heartbeat: {
				await this.heartbeat(true);
				break;
			}

			case GatewayOpcodes.Reconnect: {
				await this.destroy({
					reason: 'Told to reconnect by Discord',
					recover: WebSocketShardDestroyRecovery.Reconnect,
				});
				break;
			}

			case GatewayOpcodes.InvalidSession: {
				this.debug([`Invalid session; will attempt to resume: ${payload.d.toString()}`]);
				await this.destroy({
					reason: 'Invalid session',
					recover: payload.d ? WebSocketShardDestroyRecovery.Resume : WebSocketShardDestroyRecovery.Reconnect,
				});
				break;
			}

			case GatewayOpcodes.Hello: {
				this.emit(WebSocketShardEvents.Hello);
				this.debug([`Starting to heartbeat every ${payload.d.heartbeat_interval}ms`]);
				this.heartbeatInterval = setInterval(() => void this.heartbeat(), payload.d.heartbeat_interval);
				break;
			}

			case GatewayOpcodes.HeartbeatAck: {
				this.isAck = true;
				this.debug([`Got heartbeat ack after ${Date.now() - this.lastHeartbeatAt}ms`]);
				break;
			}
		}
	}

	private onError() {}

	private onClose() {}

	private debug(messages: [string, ...string[]]) {
		const message = `${messages[0]}\n${messages
			.slice(1)
			.map((m) => `	${m}`)
			.join('\n')}`;

		this.emit(WebSocketShardEvents.Debug, { message });
	}
}
