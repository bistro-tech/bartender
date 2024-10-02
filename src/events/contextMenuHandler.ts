import { Bot } from '@bot';
import type { BotEvent } from '@events';
import { LOGGER } from '@log';
import { formatUser } from '@log/utils';
import { ResultAsync } from 'neverthrow';

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

		const maybeErr = await ResultAsync.fromPromise(contextMenuHandler.execute(interaction), (e) => e);
		if (maybeErr.isErr()) {
			const reply = interaction.replied
				? interaction.editReply.bind(interaction)
				: interaction.reply.bind(interaction);
			await LOGGER.event.error(
				`Erreur lors du hanling du context menu ${interaction.commandName}.\n\`\`\`\n${JSON.stringify(maybeErr.error)}\n\`\`\``,
			);
			await reply(`Une erreur est survenue, merci de check les logs.`);
		}
	},
	once: false,
};
