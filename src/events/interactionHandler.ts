import { COMMANDS } from '@commands';
import { CONTEXT_MENUS, type SpecificContextMenu } from '@contextmenus';
import type { BotEvent } from '@events';
import { LISTENERS, type SpecificListener } from '@listeners';
import { LOGGER } from '@log';
import { formatUser } from '@log/utils';
import { MODALS_LISTENERS } from '@modals';
import { ComponentType, type Interaction, InteractionType } from 'discord.js';
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

		let handler: () => Promise<unknown>;
		switch (true) {
			case interaction.isChatInputCommand(): {
				const command = COMMANDS.find(({ data: { name } }) => name === interaction.commandName);
				if (!command) return LOGGER.event.debug(`${interactionID}: command not found.`);

				LOGGER.event.debug(`user ${user} executed ${interactionID}.`);

				handler = command.execute.bind(null, interaction);
				break;
			}
			case interaction.isAnySelectMenu(): {
				type ListenerKind = SpecificListener<typeof interaction.componentType>;
				const collector = LISTENERS.find(
					(listener): listener is ListenerKind =>
						listener.trigger === interaction.componentType && listener.customID === interaction.customId,
				);
				if (!collector) return LOGGER.event.debug(`${interactionID}: collector not found.`);

				LOGGER.event.debug(`user ${user} triggered ${interactionID} collector.`);

				handler = collector.execute.bind(null, interaction);
				break;
			}
			case interaction.isContextMenuCommand(): {
				type ContextMenuKind = SpecificContextMenu<typeof interaction.commandType>;
				const contextMenuHandler = CONTEXT_MENUS.find(
					(menu): menu is ContextMenuKind =>
						menu.kind === interaction.commandType && menu.data.name === interaction.commandName,
				);
				if (!contextMenuHandler) return LOGGER.event.debug(`${interactionID}: context menu not found.`);

				LOGGER.event.debug(`user ${user} executed ${interactionID}.`);

				handler = contextMenuHandler.execute.bind(null, interaction);
				break;
			}
			case interaction.isModalSubmit(): {
				const modalHandler = MODALS_LISTENERS.find((modal) => modal.customID === interaction.customId);
				if (!modalHandler) return LOGGER.event.debug(`${interactionID}: context menu not found.`);

				LOGGER.event.debug(`user ${user} executed ${interactionID}.`);

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

const getInteractionIdentifier = (interaction: Interaction): string => {
	switch (interaction.type) {
		case InteractionType.ApplicationCommand:
		case InteractionType.ApplicationCommandAutocomplete:
			return `command: '/${interaction.commandName}'`;
		case InteractionType.ModalSubmit:
			return `modal: '${interaction.customId}'`;
		case InteractionType.MessageComponent:
			switch (interaction.componentType) {
				case ComponentType.Button:
					return `button: '${interaction.customId}'`;
				case ComponentType.StringSelect:
				case ComponentType.UserSelect:
				case ComponentType.RoleSelect:
				case ComponentType.MentionableSelect:
				case ComponentType.ChannelSelect:
					return `select: '${interaction.customId}'`;
			}
	}
};