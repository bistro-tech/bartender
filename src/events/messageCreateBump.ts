import { Bot } from '@bot';
import type { BotEvent } from '@events';
import { LOGGER } from '@log';
import { BUMP_COOLDOWN, DISBOARD_BOT_ID } from '@utils/bump';
import { roleToPing } from '@utils/discord-formats';
import { InteractionType } from 'discord.js';

/**
 * @listensTo   - messageCreate
 * @description - Emitted when a message is created.
 */
export const MESSAGE_BUMP: BotEvent = {
	name: 'Message create bump',
	kind: 'messageCreate',
	once: false,
	// Clearly imperfect filter, but discord seems to have removed all good ways
	// to find commands ran on another bot.
	// So we filter based on the channel, interaction type and the bot,
	// assuming /bump is the only command ran for that bot here.
	execute: (message) => {
		if (!Bot.isBot(message.client)) return LOGGER.event.fatal('Client is not a Bot. WTF?');
		const { bumpChannel, bumpRole } = message.client.vitals;
		if (!message.author.bot) return;
		if (message.author.id !== DISBOARD_BOT_ID) return;
		if (message.channelId !== bumpChannel.id) return;
		if (
			message.interactionMetadata &&
			message.interactionMetadata.type !== InteractionType.ApplicationCommand &&
			message.interactionMetadata.type !== InteractionType.ApplicationCommandAutocomplete
		)
			return;

		// Disable on boot notification if it didn't already happen
		message.client.bumpBootReminder = false;

		LOGGER.event.debug(`Next bump reminder at ${new Date(new Date().getTime() + BUMP_COOLDOWN).toLocaleString()}`);
		setTimeout(async () => {
			await message.channel.send(`${roleToPing(bumpRole)} Il est temps de bump le serveur !`);
		}, BUMP_COOLDOWN);
	},
};
