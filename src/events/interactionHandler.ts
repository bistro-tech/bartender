import { COMMANDS } from '@commands';
import { CONTEXT_MENUS, type SpecificContextMenu } from '@contextmenus';
import type { BotEvent } from '@events';
import { LISTENERS, type SpecificListener } from '@listeners';
import { LOGGER } from '@log';
import { formatUser } from '@log/utils';
import { MODALS_LISTENERS } from '@modals';
import { getInteractionIdentifier } from '@utils/discord-interaction';
import { ResultAsync } from 'neverthrow';

/**
 * @listensTo   - interactionCreate
 * @description - Handles all incoming interactions from discord.
 */
export const INTERACTION_HANDLER: BotEvent = {
	name: 'Interaction Handler',
	kind: 'interactionCreate',
	once: false,
	execute: async (interaction) => {
		const { user: discord_user } = interaction;
		const interactionID = getInteractionIdentifier(interaction);
		const user = formatUser(discord_user);

		if (!interaction.inCachedGuild())
			return LOGGER.event.error(`[${interactionID}] not executed in a cached guild by ${user}.`);

		LOGGER.event.debug(`user ${user} triggered ${interactionID}.`);

		let handler: () => Promise<unknown>;
		switch (true) {
			case interaction.isChatInputCommand(): {
				const command = COMMANDS.find(({ data: { name } }) => name === interaction.commandName);
				if (!command) return LOGGER.event.error(`${interactionID}: command not found.`);

				handler = command.execute.bind(null, interaction);
				break;
			}
			case interaction.isAnySelectMenu(): {
				type ListenerKind = SpecificListener<typeof interaction.componentType>;
				const collector = LISTENERS.find(
					(listener): listener is ListenerKind =>
						listener.trigger === interaction.componentType && listener.customID === interaction.customId,
				);
				if (!collector) return LOGGER.event.error(`${interactionID}: collector not found.`);

				handler = collector.execute.bind(null, interaction);
				break;
			}
			case interaction.isContextMenuCommand(): {
				type ContextMenuKind = SpecificContextMenu<typeof interaction.commandType>;
				const contextMenuHandler = CONTEXT_MENUS.find(
					(menu): menu is ContextMenuKind =>
						menu.kind === interaction.commandType && menu.data.name === interaction.commandName,
				);
				if (!contextMenuHandler) return LOGGER.event.error(`${interactionID}: context menu not found.`);

				handler = contextMenuHandler.execute.bind(null, interaction);
				break;
			}
			case interaction.isModalSubmit(): {
				const modalHandler = MODALS_LISTENERS.find((modal) => modal.customID === interaction.customId);
				if (!modalHandler) return LOGGER.event.error(`${interactionID}: modal not found.`);

				handler = modalHandler.execute.bind(null, interaction);
				break;
			}
			default:
				return LOGGER.event.error(`I can't handle ${interactionID} !!`);
		}

		const res = await ResultAsync.fromPromise(handler(), (err) => err);
		if (res.isErr()) {
			const reply = interaction.replied
				? interaction.editReply.bind(interaction)
				: interaction.reply.bind(interaction);
			await LOGGER.event.error(
				`Erreur lors du hanling de ${interactionID}.\n\`\`\`\n${JSON.stringify(res.error)}\n\`\`\``,
			);
			await reply(`Une erreur est survenue, merci de check les logs.`);
		}
	},
};
