import { Bot } from '@bot';
import type { BotEvent } from '@events';
import { LOGGER } from '@log';

/**
 * @listensTo   - interactionCreate
 * @description - Used to handle bot's context menu.
 */
export const CONTEXT_MENU_HANDLER: BotEvent = {
    name: 'Context Menu Handler',
    kind: 'interactionCreate',
    async execute(interaction) {
        if (!Bot.isBot(interaction.client)) return LOGGER.event.fatal('Client is not a Bot. WTF?');
        if (!interaction.isContextMenuCommand())
            return LOGGER.event.debug(`${interaction.toJSON() as string} is not a context menu.`);

        const command = interaction.client.CONTEXT_MENUS.get(interaction.commandName);

        if (!command) return LOGGER.event.debug(`${interaction.commandName}: command not found.`);

        await command.execute(interaction);
    },
    once: false,
};
