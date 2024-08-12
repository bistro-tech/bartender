import { Bot } from '@bot';
import type { BotEvent } from '@events';
import { LOGGER } from '@log';

/**
 * @listensTo   - interactionCreate
 * @description - Used to handle bot's commands.
 */
export const COMMAND_HANDLER: BotEvent = {
    name: 'Command Handler',
    kind: 'interactionCreate',
    once: false,
    async execute(interaction) {
        if (!Bot.isBot(interaction.client)) return LOGGER.event.fatal('Client is not a Bot. WTF?');
        if (!interaction.isCommand()) return;

        const {
            commandName,
            user: { id: userID, tag: userTag },
        } = interaction;
        const user = `${userTag}(${userID})`;

        if (!interaction.inGuild()) return LOGGER.event.error(`'${commandName}' not executed in a guild by ${user}.`);
        if (!interaction.isChatInputCommand()) return LOGGER.event.debug(`'${commandName}' is not a command.`);

        const command = interaction.client.COMMANDS.get(commandName);
        if (!command) return LOGGER.event.debug(`${commandName}: command not found.`);

        await LOGGER.event.debug(`user ${user} executed '${interaction.toString()}'`);
        await command.execute(interaction);
    },
};
