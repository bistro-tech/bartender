import { Bot } from '@bot';
import type { Command } from '@commands';
import { DB } from '@db';
import { blame, discord_user } from '@db/schema';
import { LOGGER } from '@log';
import { formatUser } from '@log/utils';
import { userToPing } from '@utils/discord-formats';
import { SlashCommandBuilder } from 'discord.js';
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
		if (!Bot.isBot(interaction.client)) return LOGGER.command.fatal(interaction, 'Client is not a Bot. WTF?');
		const warner = interaction.user;
		const warnerLog = formatUser(warner);
		const reason = interaction.options.getString('reason', true);
		const warned = interaction.options.getMember('user');
		if (!warned) return LOGGER.command.fatal(interaction, "Warning a user that doesn't exists??");
		const warnedLog = formatUser(warned.user);

		switch (true) {
			case warned.id === warner.id:
				await LOGGER.command.warn(interaction, `${warnerLog} tried to warn himself, what an moron.`);
				return interaction.reply("T'es maso ou quoi?");
			case warned.user.bot:
				await LOGGER.command.warn(interaction, `${warnerLog} tried to warn a bot, what an moron.`);
				return interaction.reply('Un bot est toujours parfait.');
			case warned.permissions.has('Administrator'):
				await LOGGER.command.warn(interaction, `${warnerLog} tried to warn an admin, what an moron.`);
				return interaction.reply('An admin is always perfect, I dare you to think otherwise.');
			default:
				break;
		}

		LOGGER.command.debug(interaction, `${warnerLog} warns ${warnedLog} because: '${reason}'.`);

		const userCreation = ResultAsync.fromPromise(
			DB.insert(discord_user)
				.values([
					{ id: warned.id, display_name: warned.displayName },
					{ id: warner.id, display_name: warner.displayName },
				])
				.onConflictDoUpdate({ target: discord_user.id, set: { display_name: warned.displayName } }),
			(err) => ({ err, message: `Error when creating users ${warnedLog} or ${warnerLog}.` }),
		);
		const blameInsert = ResultAsync.fromPromise(
			DB.insert(blame).values({
				blamee_id: warned.id,
				blamer_id: warner.id,
				reason,
				kind: 'WARN',
			}),
			(err) => ({ err, message: `Error when creating warn.` }),
		);

		const res = await userCreation.andThen(() => blameInsert);
		if (res.isErr()) {
			const { err, message } = res.error;
			await LOGGER.command.error(interaction, `${message}.\n\`\`\`\n${JSON.stringify(err)}\n\`\`\``);
			return interaction.reply('Une erreur est survenue, merci de check les logs.');
		}

		LOGGER.command.debug(interaction, `${warnedLog} got warned for '${reason}'.`);
		return interaction.reply(`
			${userToPing(warned.user)} tu viens d'être warn par ${userToPing(warner)} pour la raison suivante:
			> ${reason}
			Tache de faire mieux la prochaine fois.
		`);
	},
};
