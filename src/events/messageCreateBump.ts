import { ENV } from '@env';
import type { BotEvent } from '@events';
import { LOGGER } from '@log';
import { roleIDToPing } from '@utils/discord-formats';
import { InteractionType } from 'discord.js';

import { BOOT_NOTIFICATION_SETTINGS } from './readyBumpRecover';

export const BUMP_COOLDOWN = 7_200_000; // Two hours

/**
 * @listensTo   - messageCreate
 * @description - Emitted when a message is created.
 */
export const MESSAGE_BUMP: BotEvent = {
	name: 'Message create bump',
	kind: 'messageCreate',
	once: false,
	execute: (message) => {
		if (!message.author.bot) return;
		if (!message.interactionMetadata) return;
		if (
			message.interactionMetadata.type !== InteractionType.ApplicationCommand &&
			message.interactionMetadata.type !== InteractionType.ApplicationCommandAutocomplete
		)
			return;
		const [replyEmbed] = message.embeds;
		if (!replyEmbed) return;
		if (!replyEmbed.title?.startsWith('DISBOARD')) return;
		if (!replyEmbed.description?.startsWith('Bump effectué !')) return;

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
