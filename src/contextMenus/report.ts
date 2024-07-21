import type { ContextMenu } from '@contextmenus';
import { ENV } from '@env';
import { LOGGER } from '@log';
import type {
    ContextMenuCommandInteraction,
    Message,
    MessageContextMenuCommandInteraction,
    ModalActionRowComponentBuilder,
    TextChannel,
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

export const Report: ContextMenu = {
    data: new ContextMenuCommandBuilder().setName('Signaler').setType(ApplicationCommandType.Message),
    async execute(interaction) {
        if (!interaction.isMessageContextMenuCommand()) {
            return logErrorAndReply(interaction, 'Cette commande ne peut être utilisée que sur un message.');
        }

        const modal = buildModal(interaction);
        await interaction.showModal(modal);

        const reasonModalSubmit = await interaction.awaitModalSubmit({
            filter: (i) => i.customId === modal.data.custom_id,
            time: 0,
        });

        const channel = interaction.client.channels.cache.get(ENV.MODERATION_CHANNEL_ID);
        if (!channel?.isTextBased())
            return logErrorAndReply(interaction, 'Impossible de trouver le salon de modération.');

        const reportEmbed = sendReportEmbed(
            channel as TextChannel,
            interaction,
            reasonModalSubmit.fields.getTextInputValue('report_reason'),
        );

        return reportEmbed
            .then(() => {
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
 *
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
 * @param {TextChannel} moderationChannel - The channel to send the embed to.
 * @param {MessageContextMenuCommandInteraction} interaction - The interaction to build the embed from.
 * @param {string} reason - The reason for the report.
 * @returns {Promise<Message<true>>} - A promise that resolves to true if the embed was sent successfully.
 */
async function sendReportEmbed(
    moderationChannel: TextChannel,
    interaction: MessageContextMenuCommandInteraction,
    reason: string,
): Promise<Message<true>> {
    const embed = new EmbedBuilder()
        .setTitle('Message signalé')
        .setDescription(interaction.targetMessage.content)
        .setAuthor({
            name: interaction.targetMessage.author.tag,
            iconURL: interaction.targetMessage.author.displayAvatarURL(),
        })
        .setTimestamp(interaction.targetMessage.createdTimestamp);

    return moderationChannel.send({
        content: `<@${interaction.user.id}> a signalé ce message ${interaction.targetMessage.url}.\n>>> ${reason}`,
        embeds: [embed],
    });
}

/**
 * @description - Log error and reply to the interaction.
 * @param {ContextMenuCommandInteraction} interaction - The interaction to reply to.
 * @param {string} content - The error message.
 * @returns {Promise<void>} - A promise that resolves when the error is logged and the interaction is replied to.
 */
async function logErrorAndReply(interaction: ContextMenuCommandInteraction, content: string): Promise<void> {
    await interaction.reply({
        content: 'Erreur lors du signalement.',
        ephemeral: true,
    });
    return LOGGER.context.error(interaction, content);
}
