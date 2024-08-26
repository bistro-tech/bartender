import { Bot } from '@bot';
import type { BotEvent } from '@events';
import { LOGGER } from '@log';
import { formatUser } from '@log/utils';
import { isErr, tri } from '@utils/tri';

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

		const command = interaction.client.COMMANDS.get(commandName);
		if (!command) return LOGGER.event.debug(`${commandName}: command not found.`);

		LOGGER.event.debug(`user ${user} executed '${interaction.toString()}'`);

		const maybeErr = await tri(() => command.execute(interaction));
		if (isErr(maybeErr)) {
			const reply = interaction.replied
				? interaction.editReply.bind(interaction)
				: interaction.reply.bind(interaction);
			// @ts-expect-error assume that err has a .toString() despite being an unknown type
			await LOGGER.command.error(interaction, maybeErr.err);
			await reply(`There was an unhandled error. Please check the logs.`);
		}
	},
};
