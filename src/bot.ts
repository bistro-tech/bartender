import { COMMANDS_COLLECTION } from '@commands';
import { CONTEXT_MENUS_COLLECTION } from '@contextmenus';
import { EVENTS } from '@events';
import { LOGGER } from '@log';
import type { ClientEvents, RESTPostAPIApplicationCommandsJSONBody } from 'discord.js';
import { Client, GatewayIntentBits, Routes } from 'discord.js';

import { Vitals } from './bot/vitals';

export class Bot extends Client {
	// Initialized in the start method
	// TODO: See if we can remove the !
	public vitals!: Readonly<Vitals>;

	static isBot(obj?: unknown): obj is Bot {
		return obj instanceof Bot;
	}

	constructor() {
		super({
			intents: [
				GatewayIntentBits.Guilds,
				// GatewayIntentBits.GuildMembers,
				// GatewayIntentBits.GuildModeration,
				// GatewayIntentBits.GuildEmojisAndStickers,
				// GatewayIntentBits.GuildIntegrations,
				// GatewayIntentBits.GuildWebhooks,
				// GatewayIntentBits.GuildInvites,
				// GatewayIntentBits.GuildVoiceStates,
				// GatewayIntentBits.GuildPresences,
				GatewayIntentBits.GuildMessages,
				// GatewayIntentBits.GuildMessageReactions,
				// GatewayIntentBits.GuildMessageTyping,
				// GatewayIntentBits.DirectMessages,
				// GatewayIntentBits.DirectMessageReactions,
				// GatewayIntentBits.DirectMessageTyping,
				// GatewayIntentBits.MessageContent,
				// GatewayIntentBits.GuildScheduledEvents,
				// GatewayIntentBits.AutoModerationConfiguration,
				// GatewayIntentBits.AutoModerationExecution,
				// GatewayIntentBits.GuildMessagePolls,
				// GatewayIntentBits.DirectMessagePolls
			],
		});
	}

	public async start(TOKEN: string, SERVER_ID: string): Promise<void> {
		await this.login(TOKEN);

		// ensure the bot is only on one server, ours.
		if ((await this.guilds.fetch()).size !== 1) return LOGGER.internal.fatal('Bot is on multiple servers.');

		const server = this.guilds.cache.get(SERVER_ID);
		if (!server) return LOGGER.internal.fatal("Bot isn't on our server ?");

		this.vitals = new Vitals(server);

		await this.clearCommands();
		await this.registerApplicationCommands();
		this.registerEvents();
		// retrigger because we missed the call.
		// TODO: can we remove it ?
		this.emit('ready', this as Client<true>);
	}

	private registerEvents(): void {
		for (const event of EVENTS) {
			LOGGER.internal.debug(`Registering event '${event.name}'.`);
			// because of TS-server skill issues
			type Listener = (...args: ClientEvents[typeof event.kind]) => Awaitable<void>;
			if (event.once) {
				this.once(event.kind, event.execute as Listener);
			} else {
				this.on(event.kind, event.execute as Listener);
			}
		}
	}

	private async registerApplicationCommands(): Promise<void> {
		if (!this.isReady()) return LOGGER.internal.fatal("Bot isn't logged in.");

		LOGGER.internal.debug(`Registering bot interactions in '${this.vitals.server.name}'.`);
		const body = COMMANDS_COLLECTION.each((cmd) =>
			LOGGER.internal.debug(`  Registering (/) command '${cmd.data.name}'.`),
		)
			.map<RESTPostAPIApplicationCommandsJSONBody>((cmd) => cmd.data.toJSON())
			.concat(
				CONTEXT_MENUS_COLLECTION.each((cmd) =>
					LOGGER.internal.debug(`  Registering contextMenu '${cmd.data.name}'.`),
				).map<RESTPostAPIApplicationCommandsJSONBody>((cmd) => cmd.data.toJSON()),
			);

		const url = Routes.applicationGuildCommands(this.application.id, this.vitals.server.id);
		await this.rest.put(url, { body });
	}

	private async clearCommands(): Promise<void> {
		LOGGER.internal.debug(`Clearing all commands in guild '${this.vitals.server.name}'.`);
		const guildCommands = await this.vitals.server.commands.fetch();
		for (const command of guildCommands.values()) {
			LOGGER.internal.debug(`  Clearing intéraction '${command.name}'.`);
			await command.delete();
		}
	}
}
