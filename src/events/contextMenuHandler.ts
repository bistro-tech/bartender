import { Bot } from '@bot';
import type { BotEvent } from '@events';
import { LOGGER } from '@log';
import { formatUser } from '@utils/format-user';
import { isErr, tri } from '@utils/tri';

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

        LOGGER.event.debug(`user ${formatUser(interaction.user)} executed '${interaction.commandName}'`);

        const maybeErr = await tri(() => contextMenuHandler.execute(interaction));
        if (isErr(maybeErr)) {
            const reply = interaction.replied
                ? interaction.editReply.bind(interaction)
                : interaction.reply.bind(interaction);
            // @ts-expect-error assume that err has a .toString() despite being an unknown type
            await LOGGER.context.error(interaction, maybeErr.err);
            await reply(`There was an unhandled error. Please check the logs.`);
        }
    },
    once: false,
};
