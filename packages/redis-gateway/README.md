<div align="center">
	<br />
	<p>
		<a href="https://discord.js.org"><img src="https://discord.js.org/static/logo.svg" width="546" alt="discord.js" /></a>
	</p>
	<br />
	<p>
		<a href="https://discord.gg/djs"><img src="https://img.shields.io/discord/222078108977594368?color=5865F2&logo=discord&logoColor=white" alt="Discord server" /></a>
		<a href="https://hub.docker.com/r/discordjs/redis-gateway"><img src="https://img.shields.io/docker/v/discordjs/redis-gateway.svg?sort=semver&maxAge=3600" alt="dockerhub version" /></a>
		<a href="https://hub.docker.com/r/discordjs/redis-gateway"><img src="https://img.shields.io/docker/pulls/discordjs/redis-gateway.svg?maxAge=3600" alt="dockerhub pulls" /></a>
		<a href="https://github.com/discordjs/discord.js/actions"><img src="https://github.com/discordjs/discord.js/actions/workflows/test.yml/badge.svg" alt="Build status" /></a>
	</p>
	<p>
		<a href="https://vercel.com/?utm_source=discordjs&utm_campaign=oss"><img src="https://raw.githubusercontent.com/discordjs/discord.js/main/.github/powered-by-vercel.svg" alt="Vercel" /></a>
		<a href="https://www.cloudflare.com"><img src="https://raw.githubusercontent.com/discordjs/discord.js/main/.github/powered-by-workers.png" alt="Cloudflare Workers" height="44" /></a>
	</p>
</div>

## About

`@discordjs/redis-gateway` - Discord gateway running behind Redis as a message broker

## Usage

Set up an `.env` file:

```
REDIS_URL=redis://localhost:6379
DISCORD_TOKEN=your-token-here
DISCORD_PROXY_URL=http://localhost:8080 # if you want to use an HTTP proxy for Discord API calls (optional)
INTENTS=0 # intents to use (optional, defaults to none)
SHARD_COUNT=1 # number of total shards your bot should be running (optional, defaults to Discord recommended count)
SHARD_IDS=0 # comma-separated list of shard IDs to run (optional, defaults to all shards)
SHARDS_PER_WORKER=2 # number of shards per worker_thread or "all" (optional, if not specified, all shards will be run in the main thread)
```

Quickly spin up an instance:

`docker run -d --restart unless-stopped --env-file .env --name gateway discordjs/redis-gateway`

Use it:

```js
import Redis from 'ioredis';
import { PubSubRedisBroker } from '@discordjs/brokers';
import { GatewayDispatchEvents, InteractionType, GatewayOpcodes } from 'discord-api-types/v10';

const redis = new Redis();
const broker = new PubSubRedisBroker({ redisClient: redis });

broker.on(GatewayDispatchEvents.InteractionCreate, async ({ data: { payload: interaction }, ack }) => {
	if (interaction.type !== InteractionType.ApplicationCommand) {
		return;
	}

	if (interaction.data.name === 'ping') {
		// reply with pong using your favorite Discord API library
	}

	await ack();
});

// you can also use the broker to send payloads to the gateway
await broker.publish('gateway_send', {
	op: GatewayOpcodes.PresenceUpdate,
	d: {
		activities: [{ type: ActivityType.Playing, name: 'meow :3' }],
		afk: false,
		since: null,
		status: PresenceUpdateStatus.Online,
	},
});

// if you were to start this process multiple times (e.g. multiple apps using 'work_balancing_group'),
// they would automatically work balance those interaction create events
await broker.subscribe('work_balancing_group', [GatewayDispatchEvents.InteractionCreate]);
```

For TypeScript usage, you can pass in a gereric type to the `PubSubRedisBroker` to map out all the events, a mapped
interface is available in `@discordjs/core` as `RedisBrokerDiscordEvents`.

If you wish, you can also just use `@discordjs/core`:

```ts
import { REST } from '@discordjs/rest';
import Redis from 'ioredis';
import { PubSubRedisBroker } from '@discordjs/brokers';
import {
	GatewayDispatchEvents,
	GatewayIntentBits,
	InteractionType,
	MessageFlags,
	Client,
	RedisGateway,
} from '@discordjs/core';

const rest = new REST({ version: '10' }).setToken(token);

const redis = new Redis();
// you can get retrieve your shard count however you want, it's used for some calculations and should be your bot's TOTAL shard count
// across "clusters" or anything else.
const broker = new PubSubRedisBroker({ redisClient: redis });
const gateway = new RedisGateway(broker, Number(process.env.SHARD_COUNT!));

const client = new Client({ rest, gateway });

client.on(GatewayDispatchEvents.InteractionCreate, async ({ data: interaction, api }) => {
	if (interaction.type !== InteractionType.ApplicationCommand || interaction.data.name !== 'ping') {
		return;
	}

	await api.interactions.reply(interaction.id, interaction.token, { content: 'Pong!', flags: MessageFlags.Ephemeral });
});

await gateway.init('work_balancing_group', [GatewayDispatchEvents.InteractionCreate]);
```

## Links

- [Website][website] ([source][website-source])
- [Guide][guide] ([source][guide-source])
  Also see the v13 to v14 [Update Guide][guide-update], which includes updated and removed items from the library.
- [discord.js Discord server][discord]
- [Discord API Discord server][discord-api]
- [GitHub][source]
- [Related libraries][related-libs]

## Contributing

Before creating an issue, please ensure that it hasn't already been reported/suggested, and double-check the
[documentation][documentation].  
See [the contribution guide][contributing] if you'd like to submit a PR.

## Help

If you don't understand something in the documentation, you are experiencing problems, or you just need a gentle nudge in the right direction, please don't hesitate to join our official [discord.js Server][discord].

[website]: https://discord.js.org
[website-source]: https://github.com/discordjs/discord.js/tree/main/apps/website
[guide]: https://discordjs.guide/
[guide-source]: https://github.com/discordjs/guide
[guide-update]: https://discordjs.guide/additional-info/changes-in-v14.html
[discord]: https://discord.gg/djs
[discord-api]: https://discord.gg/discord-api
[source]: https://github.com/discordjs/discord.js/tree/main/packages/redis-gateway
[related-libs]: https://discord.com/developers/docs/topics/community-resources#libraries
[contributing]: https://github.com/discordjs/discord.js/blob/main/.github/CONTRIBUTING.md
