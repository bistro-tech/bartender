import { formatUser } from '@log/utils';
import { ComponentType, type Interaction } from 'discord.js';

/**
 * A function to get the name and kind of interaction.
 * @param {Interaction} interaction _
 * @returns {string} '<kind>: <name>'
 */
export function getInteractionIdentifier(interaction: Interaction): string {
	switch (true) {
		case interaction.isChatInputCommand():
			return `command: /${interaction.commandName}`;
		case interaction.isAnySelectMenu():
			return `select_menu: '${interaction.customId}'`;
		case interaction.isUserContextMenuCommand():
			return `user_context_menu: ${interaction.commandName}`;
		case interaction.isMessageContextMenuCommand():
			return `message_context_menu: ${interaction.commandName}`;
		case interaction.isButton():
			return `button: '${interaction.customId}'`;
		case interaction.isModalSubmit():
			return `modal: '${interaction.customId}'`;
		case interaction.isAutocomplete():
			return `autocomplete: '/${interaction.commandName}'`;
		default:
			// if switch is complete, interaction is never and all good, else compileError.
			return interaction;
	}
}

/**
 * A function to get the string representation of an interaction.
 * For commands you'll get the whole command input.
 * For modals, context menus, selects etc you'll have the customID and the values passed in.
 * @param {Interaction} interaction _
 * @returns {string} _
 */
export function getInteractionDetails(interaction: Interaction): string {
	switch (true) {
		case interaction.isChatInputCommand():
			return interaction.toString();
		case interaction.isAnySelectMenu():
			return `select_menu: '${interaction.customId}' - type: ${ComponentType[interaction.componentType]} - values: [${interaction.values.join(', ')}]`;
		case interaction.isUserContextMenuCommand(): {
			const userString = formatUser(interaction.targetUser);
			return `user_context_menu: ${interaction.commandName} - user: ${userString}`;
		}
		case interaction.isMessageContextMenuCommand():
			return `message_context_menu: ${interaction.commandName} - message: ${interaction.targetMessage.id} - content: ${interaction.targetMessage.content}`;
		case interaction.isModalSubmit():
			return `modal: '${interaction.customId}' - ${interaction.fields.fields.map((val, key) => `${key}: ${val.value}`).join('\n')}`;
		case interaction.isButton():
		case interaction.isAutocomplete():
			return getInteractionIdentifier(interaction);
		default:
			// if switch is complete, interaction is never and all good, else compileError.
			return interaction;
	}
}
