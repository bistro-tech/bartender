import { Bot } from '@bot';
import type { BotEvent } from '@events';
import { LOGGER } from '@log';
import { formatUser } from '@utils/format-user';

/**
 * @listensTo   - interactionCreate
 * @description - Used to handle bot's context menu.
 */
export const CONTEXT_MENU_HANDLER: BotEvent = {
    name: 'Context Menu Handler',
    kind: 'interactionCreate',
    async execute(interaction) {
        if (!Bot.isBot(interaction.client)) return LOGGER.event.fatal('Client is not a Bot. WTF?');
        if (!interaction.isContextMenuCommand()) return;
        const contextMenuHandler = interaction.client.CONTEXT_MENUS.get(interaction.commandName);

        if (!contextMenuHandler) return LOGGER.event.debug(`${interaction.commandName}: context menu not found.`);

        await LOGGER.event.debug(`user ${formatUser(interaction.user)} executed '${interaction.commandName}'`);
        await contextMenuHandler.execute(interaction);
    },
    once: false,
};
