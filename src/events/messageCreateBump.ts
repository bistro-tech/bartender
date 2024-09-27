import { ENV } from '@env';
import type { BotEvent } from '@events';
import { LOGGER } from '@log';
import { roleIDToPing } from '@utils/discord-formats';
import { InteractionType } from 'discord.js';

import { BOOT_NOTIFICATION_SETTINGS } from './readyBumpRecover';

export const BUMP_COOLDOWN = 7_200_000; // Two hours
const DISBOARD_BOT_ID = '302050872383242240';

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
		if (!message.author.bot) return;
		if (message.author.id !== DISBOARD_BOT_ID) return;
		if (message.channelId !== ENV.BUMP_CHANNEL_ID) return;
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
			await message.channel.send(
				`${roleIDToPing(ENV.BUMP_NOTIFICATION_ROLE_ID)} Il est temps de bump le serveur !`,
			);
		}, BUMP_COOLDOWN);
	},
};
