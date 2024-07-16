import { Bot } from '@bot';
import type { BotEvent } from '@events';
import { interactionTypeToString } from '@utils/discord';

/**
 * @listensTo   - interactionCreate
 * @description - Used to handle bot's commands.
 */
export const COMMAND_HANDLER: BotEvent = {
    name: 'Command Handler',
    kind: 'interactionCreate',
    once: false,
    async execute(interaction) {
        if (!Bot.isBot(interaction.client)) return console.error('Client is not a Bot. WTF?');
        if (!interaction.isCommand())
            return console.error(`'${interactionTypeToString(interaction.type)}' is not a command.`);

        const { commandName } = interaction;

        if (!interaction.inGuild()) return console.error(`'${commandName}' not executed in a guild.`);
        if (!interaction.isChatInputCommand()) return console.error(`'${commandName}' is not a command.`);

        const command = interaction.client.COMMANDS.get(commandName);
        if (!command) return console.error(`${commandName}: command not found.`);

        await command.execute(interaction);
    },
};
