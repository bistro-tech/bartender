import type { Command } from '@commands';
import { DB } from '@db';
import { type BLAME_KIND, blameKindEmote } from '@db/enums/blame-kind';
import { blame } from '@db/schema';
import { LOGGER } from '@log';
import { formatUser } from '@log/utils';
import { dateToDiscordDate, userIDToPing, userToPing } from '@utils/discord-formats';
import { arrayChunks, mapGenerator } from '@utils/generators';
import { type APIEmbedField, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { eq } from 'drizzle-orm';

// API maximum is 25: https://discord.com/developers/docs/resources/message#embed-object-embed-structure
const MAX_NB_FIELDS = 15;

/**
 * @command     - blames
 * @description - Get the list of blames of you or the selected user have.
 */
export const LIST_BLAMES: Command = {
	data: new SlashCommandBuilder()
		.setName('list-blames')
		.setDescription('Get the list of blames of you or the selected user have.')
		.addUserOption((mention) =>
			mention
				.setName('other_user')
				.setDescription('The other user you want to see the warns of.')
				.setRequired(false),
		),
	async execute(interaction) {
		const user = interaction.options.getUser('other_user', false) ?? interaction.user;

		LOGGER.command.debug(
			interaction,
			`${formatUser(interaction.user)} asked for the blames of ${formatUser(user)}.`,
		);

		const userBlames = await DB.select()
			.from(blame)
			.where(eq(blame.blamee_id, user.id))
			.orderBy(blame.kind, blame.created_at, blame.expires_at);

		if (!userBlames.length) {
			return interaction.reply(`${userToPing(user)} est un membre examplaire de la communauté !`);
		}

		const groupedBlames = Object.groupBy(userBlames, ({ kind }) => kind);
		const blamesSummary = Object.entries(groupedBlames)
			.map(([kind, { length: count }]) => `${blameKindEmote(kind as BLAME_KIND)}: ${count}`)
			.join(' ');

		const fields: Array<APIEmbedField> = userBlames.map(
			({ kind, created_at, updated_at, expires_at, reason, blamer_id }) => ({
				name: `${blameKindEmote(kind)} ${kind} - ${dateToDiscordDate(created_at)} | ${dateToDiscordDate(created_at, 'relative-time')} ${updated_at.getTime() !== created_at.getTime() ? `*(Mis à jour le ${dateToDiscordDate(updated_at)})*` : ''}`,
				value: `
					> **Par**: ${userIDToPing(blamer_id)}
					> **Raison**: ${reason}
					${expires_at ? `> **Expire**: ${dateToDiscordDate(expires_at)}` : ''}
				`,
				inline: false,
			}),
		);

		const blameEmbeds = Array.from(
			mapGenerator(arrayChunks(fields, MAX_NB_FIELDS), (fields) =>
				new EmbedBuilder().setDescription(`Historique de ${userToPing(user)}`).addFields(fields),
			),
		);

		LOGGER.command.debug(interaction, `Blames summary of ${formatUser(user)}: ${blamesSummary}.`);

		return interaction.reply({
			content: `Résumé: ${userBlames.length} blames; ${blamesSummary}`,
			embeds: blameEmbeds,
		});
	},
};
