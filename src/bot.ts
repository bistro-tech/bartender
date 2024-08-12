import type { Command } from '@commands';
import { COMMANDS_COLLECTION } from '@commands';
import type { ContextMenu } from '@contextmenus';
import { CONTEXT_MENUS_COLLECTION } from '@contextmenus';
import { EVENTS } from '@events';
import { LOGGER } from '@log';
import type {
    ClientEvents,
    Collection,
    OAuth2Guild,
    RESTPostAPIApplicationCommandsJSONBody,
    RESTPostAPIContextMenuApplicationCommandsJSONBody,
} from 'discord.js';
import { Client, GatewayIntentBits, REST, Routes } from 'discord.js';

const BotSymbol = Symbol();

export class Bot extends Client {
    public readonly COMMANDS: Collection<string, Command> = COMMANDS_COLLECTION;
    public readonly CONTEXT_MENUS: Collection<string, ContextMenu> = CONTEXT_MENUS_COLLECTION;

    private readonly [BotSymbol] = true;
    static isBot(obj: unknown): obj is Bot {
        return (obj as Bot)[BotSymbol];
    }

    constructor(
        private readonly TOKEN: string,
        private readonly CLIENT_ID: string,
    ) {
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

        for (const event of EVENTS) {
            void LOGGER.internal.debug(`Registering event '${event.name}'.`);
            // because of TS-server skill issues
            type Listener = (...args: ClientEvents[typeof event.kind]) => Awaitable<void>;
            if (event.once) {
                this.once(event.kind, event.execute as Listener);
            } else {
                this.on(event.kind, event.execute as Listener);
            }
        }
    }

    public async start(): Promise<void> {
        await this.login(this.TOKEN);
        const guilds = await this.guilds.fetch();
        await this.clearCommands();
        return this.registerSlashCommands(guilds);
    }

    private async registerSlashCommands(guilds: Collection<string, OAuth2Guild>): Promise<void> {
        const rest = new REST().setToken(this.TOKEN);
        const commands: Array<RESTPostAPIApplicationCommandsJSONBody> = this.COMMANDS.each((cmd) =>
            LOGGER.internal.debug(`Command '${cmd.data.name}' gets registered.`),
        ).map((cmd) => cmd.data.toJSON());

        const contextMenus: Array<RESTPostAPIContextMenuApplicationCommandsJSONBody> = this.CONTEXT_MENUS.each((cmd) =>
            LOGGER.internal.debug(`ContextMenus '${cmd.data.name}' gets registered.`),
        ).map((cmd) => cmd.data.toJSON());

        for (const guild of guilds.values()) {
            void LOGGER.internal.debug(`Registering commands in '${guild.name}'.`);
            await rest.put(Routes.applicationGuildCommands(this.CLIENT_ID, guild.id), {
                body: commands.concat(contextMenus),
            });
        }
    }

    private async clearCommands(): Promise<void> {
        void LOGGER.internal.debug(`Clearing all guild commands.`);
        for (const guild of this.guilds.cache.values()) {
            void LOGGER.internal.debug(`Clearing all commands in guild '${guild.name}'.`);
            for (const command of guild.commands.cache.values()) {
                await guild.commands.delete(command.id);
            }
        }

        void LOGGER.internal.debug(`Clearing application commands.`);
        const applicationCommands = (await this.application?.commands.fetch()) ?? [];
        for (const command of applicationCommands.values()) {
            void LOGGER.internal.debug(`Clearing commands '${command.name}'.`);
            await command.delete();
        }
    }
}
