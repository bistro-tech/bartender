import { Bot } from '@bot';
import { COMMANDS_COLLECTION } from '@commands';
import { CONTEXT_MENUS_COLLECTION } from '@contextmenus';
import type { BotEvent } from '@events';
import { COLLECTORS_COLLECTION } from '@listeners';
import { LOGGER } from '@log';
import { formatUser } from '@log/utils';
import { ComponentType, type Interaction, InteractionType } from 'discord.js';

/**
 * @listensTo   - interactionCreate
 * @description - Handles all incoming interactions from discord.
 */
export const INTERACTION_HANDLER: BotEvent = {
	name: 'Interaction Handler',
	kind: 'interactionCreate',
	once: false,
	execute: async (interaction) => {
		if (!Bot.isBot(interaction.client)) return LOGGER.event.fatal('Client is not a Bot. WTF?');
		const { user: discord_user } = interaction;
		const interactionID = getInteractionIdentifier(interaction);
		const user = formatUser(discord_user);

		if (!interaction.inGuild()) return LOGGER.event.error(`[${interactionID}] not executed in a guild by ${user}.`);

		let handler: () => Awaitable<unknown>;
		switch (true) {
			case interaction.isChatInputCommand(): {
				const command = COMMANDS_COLLECTION.get(interaction.commandName);
				if (!command) return LOGGER.event.debug(`${interactionID}: command not found.`);

				LOGGER.event.debug(`user ${user} executed ${interactionID}.`);

				handler = command.execute.bind(null, interaction);
				break;
			}
			case interaction.isAnySelectMenu(): {
				const collector = COLLECTORS_COLLECTION.get(interaction.customId);
				if (!collector) return LOGGER.event.debug(`${interactionID}: collector not found.`);

				LOGGER.event.debug(`user ${user} triggered ${interactionID} collector.`);

				// @ts-expect-error tkt je sais ce que je fais
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				handler = collector.execute.bind(null, interaction as any);
				break;
			}
			case interaction.isContextMenuCommand(): {
				const contextMenuHandler = CONTEXT_MENUS_COLLECTION.get(interaction.commandName);
				if (!contextMenuHandler) return LOGGER.event.debug(`${interactionID}: context menu not found.`);

				LOGGER.event.debug(`user ${user} executed ${interactionID}.`);

				handler = contextMenuHandler.execute.bind(null, interaction);
				break;
			}
			default:
				return LOGGER.event.error(`I can't handle ${interactionID} !!`);
		}
		// TODO: error handling
		await handler();
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
