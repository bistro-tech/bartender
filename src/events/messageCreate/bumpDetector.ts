import { Bot } from '@bot';
import type { BotEvent } from '@events';
import { LOGGER } from '@log';
import { roleToPing } from '@utils/discord-formats';
import { InteractionType } from 'discord.js';

import { BOOT_NOTIFICATION_SETTINGS } from '../ready/bumpRecover';

export const BUMP_COOLDOWN = 7_200_000; // Two hours
const DISBOARD_BOT_ID = '302050872383242240';

/**
 * @listensTo   - messageCreate
 * @description - Emitted when a message is created.
 */
export const BUMP_DETECTOR: BotEvent = {
	name: 'Bump detector',
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
		BOOT_NOTIFICATION_SETTINGS.should = false;

		LOGGER.event.debug(`Next bump reminder at ${new Date(new Date().getTime() + BUMP_COOLDOWN).toLocaleString()}`);
		setTimeout(async () => {
			await message.channel.send(`${roleToPing(bumpRole)} Il est temps de bump le serveur !`);
		}, BUMP_COOLDOWN);
	},
};
