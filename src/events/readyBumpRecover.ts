import { ENV } from '@env';
import type { BotEvent } from '@events';
import { LOGGER } from '@log';
import { roleIDToPing } from '@utils/discord-formats';

import { BUMP_COOLDOWN } from './messageCreateBump';

// Object because simple bool can't be edited from an import/export
export const BOOT_NOTIFICATION_SETTINGS = { should: true };

/**
 * @listensTo   - ready
 * @description - Upon boot starts a 2hour timer and tells users to bump if not disabled before.
 */
export const READY_BUMP_RECOVER: BotEvent = {
	name: 'Ready bump recover',
	kind: 'ready',
	once: true,
	execute: async (client) => {
		const server = client.guilds.cache.get(ENV.SERVER_ID);
		if (!server) return LOGGER.event.fatal(`Client doesn't have access to guild ${ENV.SERVER_ID}`);

		const bumpChannel = await server.channels.fetch(ENV.BUMP_CHANNEL_ID);
		if (!bumpChannel) return LOGGER.event.error(`Could not find bump channel (${ENV.BUMP_CHANNEL_ID}) upon boot !`);
		if (!bumpChannel.isTextBased())
			return LOGGER.event.error(`Bump channel (${ENV.BUMP_CHANNEL_ID}) is not text based ??`);

		LOGGER.event.debug(
			`I rebooted, triggering a bump reminder in ${new Date(new Date().getTime() + BUMP_COOLDOWN).toLocaleString()}`,
		);
		setTimeout(async () => {
			if (!BOOT_NOTIFICATION_SETTINGS.should) return;

			await bumpChannel.send(
				`${roleIDToPing(ENV.BUMP_NOTIFICATION_ROLE_ID)} J'ai redémarré, je pense qu'il est l'heure de bump?`,
			);
		}, BUMP_COOLDOWN);
	},
};
