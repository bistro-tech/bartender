import type { ContextMenu } from '@contextmenus';
import { LOGGER } from '@log';
import { formatUser } from '@log/utils';
import type { ModalActionRowComponentBuilder } from 'discord.js';
import {
	ActionRowBuilder,
	ApplicationCommandType,
	ContextMenuCommandBuilder,
	ModalBuilder,
	TextInputBuilder,
	TextInputStyle,
} from 'discord.js';

/**
 * Menu used to report a user's message to the staff for bad behavior.
 */
export const REPORT: ContextMenu = {
	kind: ApplicationCommandType.Message,
	data: new ContextMenuCommandBuilder().setName('Signaler').setType(ApplicationCommandType.Message),
	execute: async (interaction) => {
		LOGGER.interaction.debug(
			interaction,
			`${formatUser(interaction.user)} wants to report ${formatUser(interaction.targetMessage.author)}'s message '${interaction.targetMessage.content}'(${interaction.targetMessage.url}).`,
		);
		return interaction.showModal(
			new ModalBuilder()
				.setTitle('Signaler un message')
				.setCustomId('report_modal') // TODO
				.addComponents(
					new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(
						new TextInputBuilder()
							.setCustomId('report_reason') // TODO
							.setLabel('Pourquoi signalez-vous ce message ?')
							.setStyle(TextInputStyle.Paragraph),
					),
				),
		);
	},
};
