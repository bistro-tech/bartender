import { Bot } from '@bot';
import { COLLECTORS_COLLECTION } from '@collectors';
import { COMMANDS_COLLECTION } from '@commands';
import { CONTEXT_MENUS_COLLECTION } from '@contextmenus';
import type { BotEvent } from '@events';
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

		switch (true) {
			case interaction.isChatInputCommand(): {
				const command = COMMANDS_COLLECTION.get(interaction.commandName);
				if (!command) return LOGGER.event.debug(`${interactionID}: command not found.`);

				LOGGER.event.debug(`user ${user} executed ${interactionID}.`);

				// TODO: err handling
				await command.execute(interaction);
				return;
			}
			case interaction.isAnySelectMenu(): {
				const collector = COLLECTORS_COLLECTION.get(interaction.customId);
				if (!collector) return LOGGER.event.debug(`${interactionID}: collector not found.`);

				LOGGER.event.debug(`user ${user} triggered ${interactionID} collector.`);

				// TODO: err handling
				// eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any
				await collector.execute(interaction as any);
				return;
			}
			case interaction.isContextMenuCommand(): {
				const contextMenuHandler = CONTEXT_MENUS_COLLECTION.get(interaction.commandName);
				if (!contextMenuHandler) return LOGGER.event.debug(`${interactionID}: context menu not found.`);

				LOGGER.event.debug(`user ${user} executed ${interactionID}.`);

				// TODO: err handling
				await contextMenuHandler.execute(interaction);
				return;
			}
			default: {
				return LOGGER.event.error(`I can't handle ${interactionID} !!`);
			}
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
