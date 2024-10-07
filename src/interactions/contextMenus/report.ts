import { Bot } from '@bot';
import type { ContextMenu } from '@contextmenus';
import { LOGGER } from '@log';
import { userToPing } from '@utils/discord-formats';
import type {
	ContextMenuCommandInteraction,
	GuildTextBasedChannel,
	Message,
	MessageContextMenuCommandInteraction,
	ModalActionRowComponentBuilder,
	UserContextMenuCommandInteraction,
} from 'discord.js';
import {
	ActionRowBuilder,
	ApplicationCommandType,
	ContextMenuCommandBuilder,
	EmbedBuilder,
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
		if (!Bot.isBot(interaction.client)) return LOGGER.interaction.fatal(interaction, 'Client is not a Bot. WTF?');

		const moderationChannel = interaction.client.vitals.moderationChannel;

		const modal = buildModal(interaction);
		await interaction.showModal(modal);

		const reasonModalSubmit = await interaction.awaitModalSubmit({
			filter: (i) => i.customId === modal.data.custom_id,
			time: 0,
		});

		const reportEmbed = sendReportEmbed(
			moderationChannel,
			interaction,
			reasonModalSubmit.fields.getTextInputValue('report_reason'),
		);

		return reportEmbed
			.then(() => {
				LOGGER.interaction.debug(interaction, `Reported message : '${interaction.targetMessage.url}'`);

				return reasonModalSubmit.reply({
					content: 'Message signalé.',
					ephemeral: true,
				});
			})
			.catch((_) => {
				return logErrorAndReply(interaction, `Erreur lors de l'envoi du signalement.`);
			});
	},
};

/**
 * @description - Builds a modal for the report command.
 * @param {ContextMenuCommandInteraction} interaction - The interaction to build the modal from.
 * @returns {ModalBuilder} - The built modal.
 */
function buildModal(interaction: ContextMenuCommandInteraction): ModalBuilder {
	const custom_id_modal = `report_${interaction.user.id}_${Date.now().toString()}`;
	const reportReason = new TextInputBuilder()
		.setCustomId('report_reason')
		.setLabel('Pourquoi signalez-vous ce message ?')
		.setStyle(TextInputStyle.Paragraph);

	return new ModalBuilder()
		.setTitle('Signaler un message')
		.setCustomId(custom_id_modal)
		.addComponents(new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(reportReason));
}

/**
 * @description - Build and send the report embed.
 * @param {GuildTextBasedChannel} moderationChannel - The channel to send the embed to.
 * @param {MessageContextMenuCommandInteraction} interaction - The interaction to build the embed from.
 * @param {string} reason - The reason for the report.
 * @returns {Promise<Message>} - A promise that resolves to true if the embed was sent successfully.
 */
async function sendReportEmbed(
	moderationChannel: GuildTextBasedChannel,
	interaction: MessageContextMenuCommandInteraction,
	reason: string,
): Promise<Message> {
	const embed = new EmbedBuilder()
		.setTitle('Message signalé')
		.setDescription(interaction.targetMessage.content)
		.setAuthor({
			name: interaction.targetMessage.author.tag,
			iconURL: interaction.targetMessage.author.displayAvatarURL(),
		})
		.setTimestamp(interaction.targetMessage.createdTimestamp);

	return moderationChannel.send({
		content: `${userToPing(interaction.user)} a signalé ce message ${interaction.targetMessage.url}.\n>>> ${reason}`,
		embeds: [embed],
	});
}

/**
 * @description - Log error and reply to the interaction.
 * @param {UserContextMenuCommandInteraction | MessageContextMenuCommandInteraction} interaction - The interaction to reply to.
 * @param {string} content - The error message.
 * @returns {Promise<void>} - A promise that resolves when the error is logged and the interaction is replied to.
 */
async function logErrorAndReply(
	interaction: UserContextMenuCommandInteraction | MessageContextMenuCommandInteraction,
	content: string,
): Promise<void> {
	await interaction.reply({
		content: 'Erreur lors du signalement.',
		ephemeral: true,
	});
	return LOGGER.interaction.error(interaction, content);
}
