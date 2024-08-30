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
		const warned = interaction.options.getUser('user', true);
		const issuer = interaction.user;

		if (warned.id === issuer.id) {
			await LOGGER.command.warn(interaction, `${issuer.displayName} tried to warn himself, what an moron.`);
			return interaction.reply("You can't warn yourself.");
		}

		await DB.insert(discord_user)
			.values({ id: warned.id, display_name: warned.displayName })
			.onConflictDoUpdate({ target: discord_user.id, set: { display_name: warned.displayName } })
			.returning({ id: discord_user.id });

		await DB.insert(blame).values({
			blamee_id: warned.id,
			blamer_id: issuer.id,
			reason,
			kind: 'WARN',
		});

		return interaction.reply(`
			${userToPing(warned)} tu viens d'être warn par ${userToPing(issuer)} pour la raison suivante:
			> ${reason}
			Tache de faire mieux la prochaine fois.
		`);
	},
};
