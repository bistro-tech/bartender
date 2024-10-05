import { Bot } from '@bot';
import { COMMANDS_COLLECTION } from '@commands';
import type { BotEvent } from '@events';
import { LOGGER } from '@log';
import { formatUser } from '@log/utils';
import { ResultAsync } from 'neverthrow';

/**
 * @listensTo   - interactionCreate
 * @description - Used to handle bot's commands.
 */
export const COMMAND_HANDLER: BotEvent = {
	name: 'Command Handler',
	kind: 'interactionCreate',
	once: false,
	async execute(interaction) {
		if (!Bot.isBot(interaction.client)) return LOGGER.event.fatal('Client is not a Bot. WTF?');
		if (!interaction.isCommand()) return;

		const { commandName, user: discord_user } = interaction;
		const user = formatUser(discord_user);

		if (!interaction.inGuild()) return LOGGER.event.error(`'${commandName}' not executed in a guild by ${user}.`);
		if (!interaction.isChatInputCommand()) return;

		const command = COMMANDS_COLLECTION.get(commandName);
		if (!command) return LOGGER.event.debug(`${commandName}: command not found.`);

		LOGGER.event.debug(`user ${user} executed '${interaction.toString()}'`);

		const maybeErr = await ResultAsync.fromPromise(command.execute(interaction), (e) => e);
		if (maybeErr.isErr()) {
			const reply = interaction.replied
				? interaction.editReply.bind(interaction)
				: interaction.reply.bind(interaction);
			await LOGGER.event.error(
				`Erreur lors du hanling de command /${interaction.commandName}.\n\`\`\`\n${JSON.stringify(maybeErr.error)}\n\`\`\``,
			);
			await reply(`Une erreur est survenue, merci de check les logs.`);
		}
	},
};
