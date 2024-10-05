import type { Command } from '@commands';
import { DB } from '@db';
import { blame, discord_user } from '@db/schema';
import { LOGGER } from '@log';
import { formatUser } from '@log/utils';
import { userToPing } from '@utils/discord-formats';
import { SlashCommandBuilder } from 'discord.js';
import { sql } from 'drizzle-orm';
import { ResultAsync } from 'neverthrow';

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

		LOGGER.interaction.debug(
			interaction,
			`${formatUser(issuer)} tries to warn ${formatUser(warned)} because: '${reason}'.`,
		);

		if (warned.id === issuer.id) {
			await LOGGER.interaction.warn(interaction, `${issuer.displayName} tried to warn himself, what an moron.`);
			return interaction.reply("You can't warn yourself.");
		}

		if (warned.bot) {
			await LOGGER.interaction.warn(interaction, `${issuer.displayName} tried to warn a bot, what an moron.`);
			return interaction.reply("You can't warn a bot.");
		}

		const member = await interaction.guild?.members.fetch(warned.id);
		if (member?.permissions.has('Administrator')) {
			await LOGGER.interaction.warn(interaction, `${issuer.displayName} tried to warn an admin, what an moron.`);
			return interaction.reply('An admin is always perfect, I dare you to think otherwise.');
		}

		const userCreation = ResultAsync.fromPromise(
			DB.insert(discord_user)
				.values([
					{ id: warned.id, display_name: warned.displayName },
					{ id: issuer.id, display_name: issuer.displayName },
				])
				.onConflictDoUpdate({ target: discord_user.id, set: { display_name: sql`excluded.display_name` } }),
			(err) => ({ err, message: `Error when creating users ${formatUser(warned)} or ${formatUser(issuer)}.` }),
		);
		const blameInsert = ResultAsync.fromPromise(
			DB.insert(blame).values({
				blamee_id: warned.id,
				blamer_id: issuer.id,
				reason,
				kind: 'WARN',
			}),
			(err) => ({ err, message: `Error when creating warn.` }),
		);

		const res = await userCreation.andThen(() => blameInsert);
		if (res.isErr()) {
			const { err, message } = res.error;
			await LOGGER.interaction.error(interaction, `${message}.\n\`\`\`\n${JSON.stringify(err)}\n\`\`\``);
			return interaction.reply('Une erreur est survenue, merci de check les logs.');
		}

		LOGGER.interaction.debug(interaction, `${formatUser(warned)} got warned for '${reason}'.`);
		return interaction.reply(`
			${userToPing(warned)} tu viens d'être warn par ${userToPing(issuer)} pour la raison suivante:
			> ${reason}
			Tache de faire mieux la prochaine fois.
		`);
	},
};
