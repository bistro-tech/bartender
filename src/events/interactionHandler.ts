import { COMMANDS_COLLECTION } from '@commands';
import { CONTEXT_MENUS_COLLECTION } from '@contextmenus';
import type { BotEvent } from '@events';
import { COLLECTORS_COLLECTION } from '@listeners';
import { LOGGER } from '@log';
import { formatUser } from '@log/utils';
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
				const command = COMMANDS_COLLECTION.get(interaction.commandName);
				if (!command) return LOGGER.event.error(`${interactionID}: command not found.`);

				handler = command.execute.bind(null, interaction);
				break;
			}
			case interaction.isAnySelectMenu(): {
				const collector = COLLECTORS_COLLECTION.get(interaction.customId);
				if (!collector) return LOGGER.event.error(`${interactionID}: collector not found.`);

				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				handler = collector.execute.bind(null, interaction as any);
				break;
			}
			case interaction.isContextMenuCommand(): {
				const contextMenuHandler = CONTEXT_MENUS_COLLECTION.get(interaction.commandName);
				if (!contextMenuHandler) return LOGGER.event.error(`${interactionID}: context menu not found.`);

				handler = contextMenuHandler.execute.bind(null, interaction);
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
