import { Bot } from '@bot';
import { LOGGER } from '@log';
import type { Modal } from '@modals';
import { userToPing } from '@utils/discord-formats';
import { EmbedBuilder, type MessageCreateOptions, type ModalMessageModalSubmitInteraction } from 'discord.js';

export const REPORT: Modal</* fromMessage */ true> = {
	customID: 'report',
	execute: async (interaction) => {
		if (!Bot.isBot(interaction.client)) return LOGGER.interaction.fatal(interaction, 'Client is not a Bot. WTF?');

		const reason = interaction.fields.getTextInputValue('report_reason');
		const moderationChannel = interaction.client.vitals.moderationChannel;

		await moderationChannel.send(buildReportMessage(reason, interaction));
		LOGGER.interaction.debug(interaction, `Reported message : '${interaction.message.url}'`);

		return interaction.reply({
			content: 'Message signalé.',
			ephemeral: true,
		});
	},
};

/**
 * @description - Build and send the report embed.
 * @param {string} reason - Why was the user reported.
 * @param {ModalMessageModalSubmitInteraction} interaction - The interaction to build the embed from.
 * @returns {MessageCreateOptions} - A promise that resolves to true if the embed was sent successfully.
 */
function buildReportMessage(
	reason: string,
	{ message, user }: ModalMessageModalSubmitInteraction<'cached'>,
): MessageCreateOptions {
	const embed = new EmbedBuilder()
		.setTitle('Message signalé')
		.setDescription(message.content)
		.setAuthor({
			name: message.author.tag,
			iconURL: message.author.displayAvatarURL(),
		})
		.setTimestamp(message.createdTimestamp);
	return {
		content: `${userToPing(user)} a signalé ce message ${message.url}.\n>>> ${reason}`,
		embeds: [embed],
	};
}
