import type { Command } from '@commands';
import { DB } from '@db';
import { blame, discord_user } from '@db/schema';
import { LOGGER } from '@log';
import { userToPing } from '@utils/discord-formats';
import { SlashCommandBuilder } from 'discord.js';

/**
 * @command     - warn
 * @description - Warns a user that isn't nice!
 */
export const WARN: Command = {
	data: new SlashCommandBuilder()
		.setName('warn')
		.setDescription("Warns a user that isn't nice!")
		.setDescriptionLocalizations({
			fr: 'Warn un utilisateur pas gentil.',
		})
		.addStringOption((option) =>
			option
				.setName('reason')
				.setDescription('Why is that user being warned for?')
				.setDescriptionLocalizations({
					fr: 'Pourquoi cet utilisateur se fait warn?',
				})
				.setRequired(true),
		)
		// add expiration option?
		.addUserOption((option) =>
			option
				.setName('user')
				.setDescription("Who's getting a warn?")
				.setDescriptionLocalizations({
					fr: 'Qui est vilain?',
				})
				.setRequired(true),
		),
	async execute(interaction) {
		const reason = interaction.options.getString('reason', true);
		const blamee = interaction.options.getUser('user', true);
		const blamer = interaction.user;

		if (blamee.id === blamer.id) {
			await LOGGER.command.warn(interaction, `${blamer.displayName} tried to warn himself, what an moron.`);
			return interaction.reply("You can't warn yourself.");
		}

		await DB.insert(discord_user)
			.values({ id: blamee.id, display_name: blamee.displayName })
			.onConflictDoUpdate({ target: discord_user.id, set: { display_name: blamee.displayName } })
			.returning({ id: discord_user.id });

		await DB.insert(blame).values({
			blamee_id: blamee.id,
			blamer_id: blamer.id,
			reason,
			kind: 'WARN',
		});

		return interaction.reply(`
			${userToPing(blamee)} tu viens d'être warn par ${userToPing(blamer)} pour la raison suivante:
			> ${reason}
			Tache de faire mieux la prochaine fois.
		`);
	},
};
