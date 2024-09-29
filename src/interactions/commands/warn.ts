import type { Command } from '@commands';
import { DB } from '@db';
import { blame, discord_user } from '@db/schema';
import { LOGGER } from '@log';
import { formatUser } from '@log/utils';
import { userToPing } from '@utils/discord-formats';
import { isErr, tri } from '@utils/tri';
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

		LOGGER.command.debug(
			interaction,
			`${formatUser(issuer)} tries to warn ${formatUser(warned)} because: '${reason}'.`,
		);

		if (warned.id === issuer.id) {
			await LOGGER.command.warn(interaction, `${issuer.displayName} tried to warn himself, what an moron.`);
			return interaction.reply("You can't warn yourself.");
		}

		if (warned.bot) {
			await LOGGER.command.warn(interaction, `${issuer.displayName} tried to warn a bot, what an moron.`);
			return interaction.reply("You can't warn a bot.");
		}

		const member = await interaction.guild?.members.fetch(warned.id);
		if (member?.permissions.has('Administrator')) {
			await LOGGER.command.warn(interaction, `${issuer.displayName} tried to warn an admin, what an moron.`);
			return interaction.reply('An admin is always perfect, I dare you to think otherwise.');
		}

		// ensure both issuer and warned exist in DB.
		const creationUsersErr = await tri(() =>
			DB.insert(discord_user)
				.values([
					{ id: warned.id, display_name: warned.displayName },
					{ id: issuer.id, display_name: issuer.displayName },
				])
				.onConflictDoUpdate({ target: discord_user.id, set: { display_name: warned.displayName } }),
		);
		if (isErr(creationUsersErr)) {
			await LOGGER.command.error(
				interaction,
				// eslint-disable-next-line @typescript-eslint/restrict-template-expressions -- drizzle errors implements .toString().
				`Failed to create user ${formatUser(warned)}.\n > ${creationUsersErr.err} \n\`\`\`\n${JSON.stringify(creationUsersErr.err)}\n\`\`\``,
			);
			return interaction.reply("Une erreur est survenue lors de la création de l'utilisateur warned en DB.");
		}

		const creationBlameErr = await tri(() =>
			DB.insert(blame).values({
				blamee_id: warned.id,
				blamer_id: issuer.id,
				reason,
				kind: 'WARN',
			}),
		);
		if (isErr(creationBlameErr)) {
			await LOGGER.command.error(
				interaction,
				// eslint-disable-next-line @typescript-eslint/restrict-template-expressions -- drizzle errors implements .toString().
				`Failed to blame user ${formatUser(warned)}.\n > ${creationBlameErr.err} \n\`\`\`\n${JSON.stringify(creationBlameErr.err)}\n\`\`\``,
			);
			return interaction.reply('Une erreur est survenue lors de la création du WARN en DB.');
		}

		LOGGER.command.debug(interaction, `${formatUser(warned)} got warned for '${reason}'.`);
		return interaction.reply(`
			${userToPing(warned)} tu viens d'être warn par ${userToPing(issuer)} pour la raison suivante:
			> ${reason}
			Tache de faire mieux la prochaine fois.
		`);
	},
};
