import { Bot } from '@bot';
import { COLLECTORS_COLLECTION } from '@collectors';
import type { BotEvent } from '@events';
import { LOGGER } from '@log';
import { formatUser } from '@log/utils';
import { ResultAsync } from 'neverthrow';

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

		const collector = COLLECTORS_COLLECTION.get(customId);
		if (!collector) return LOGGER.event.debug(`${customId}: collector not found.`);

		LOGGER.event.debug(`user ${user} triggered '${customId}' collector.`);

		// OK while we only have one collector, will be fixed right after
		const maybeErr = await ResultAsync.fromPromise(
			// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-argument
			collector.execute(interaction as any),
			(e) => e,
		);
		if (maybeErr.isErr()) {
			const reply = interaction.replied
				? interaction.editReply.bind(interaction)
				: interaction.reply.bind(interaction);
			await LOGGER.event.error(
				`Erreur lors du hanling du collector ${interaction.customId}.\n\`\`\`\n${JSON.stringify(maybeErr.error)}\n\`\`\``,
			);
			await reply(`Une erreur est survenue, merci de check les logs.`);
		}
	},
};
