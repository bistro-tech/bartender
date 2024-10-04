import { Bot } from '@bot';
import type { BotEvent } from '@events';
import { LOGGER } from '@log';
import { formatUser } from '@log/utils';
import { isErr, tri } from '@utils/tri';

/**
 * @listensTo   - interactionCreate
 * @description - Used to handle bot's menu collectors.
 */
export const COLLECTOR_HANDLER: BotEvent = {
	name: 'Collector Handler',
	kind: 'interactionCreate',
	once: false,
	async execute(interaction) {
		if (!Bot.isBot(interaction.client)) return LOGGER.event.fatal('Client is not a Bot. WTF?');
		if (!interaction.isAnySelectMenu()) return;

		const { customId, user: discord_user } = interaction;
		const user = formatUser(discord_user);

		const collector = interaction.client.COLLECTORS.get(customId);
		if (!collector) return LOGGER.event.debug(`${customId}: collector not found.`);

		LOGGER.event.debug(`user ${user} triggered '${customId}' collector.`);

		// OK while we only have one collector, will be fixed right after
		// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-argument
		const maybeErr = await tri(() => collector.execute(interaction.client as Bot, interaction as any));
		if (maybeErr && isErr(maybeErr)) {
			const reply = interaction.replied
				? interaction.editReply.bind(interaction)
				: interaction.reply.bind(interaction);
			// @ts-expect-error assume that err has a .toString() despite being an unknown type
			await LOGGER.interaction.error(interaction, maybeErr.err);
			await reply(`There was an unhandled error. Please check the logs.`);
		}
	},
};
