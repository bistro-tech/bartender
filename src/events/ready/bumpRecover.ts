import { ENV } from '@env';
import type { BotEvent } from '@events';
import { LOGGER } from '@log';
import { roleIDToPing } from '@utils/discord-formats';

import { BUMP_COOLDOWN } from '../messageCreate/bumpDetector';

// Object because simple bool can't be edited from an import/export
export const BOOT_NOTIFICATION_SETTINGS = { should: true };

/**
 * @listensTo   - ready
 * @description - Upon boot starts a 2hour timer and tells users to bump if not disabled before.
 */
export const BUMP_RECOVER: BotEvent = {
	name: 'Bump recover',
	kind: 'ready',
	once: true,
	execute: async (client) => {
		const server = client.guilds.cache.get(ENV.SERVER_ID);
		if (!server) return LOGGER.event.fatal(`Client doesn't have access to guild ${ENV.SERVER_ID}`);

		const bumpChannel = await server.channels.fetch(ENV.BUMP_CHANNEL_ID);
		if (!bumpChannel) return LOGGER.event.error(`Could not find bump channel (${ENV.BUMP_CHANNEL_ID}) upon boot !`);
		if (!bumpChannel.isTextBased())
			return LOGGER.event.error(`Bump channel (${ENV.BUMP_CHANNEL_ID}) is not text based ??`);

		const [lastMessage] = await bumpChannel.messages.fetch({ limit: 1 });
		const lastMessageTime = lastMessage?.[1].createdAt.getTime();
		const timeSinceLastMessage = lastMessageTime ? new Date().getTime() - lastMessageTime : Infinity;
		const notifMessage = `${roleIDToPing(ENV.BUMP_NOTIFICATION_ROLE_ID)} J'ai redémarré, je pense qu'il est l'heure de bump?`;

		// if latest message is older than BUMP_COOLDOWN we ask for immediate bump.
		if (timeSinceLastMessage > BUMP_COOLDOWN) {
			LOGGER.event.debug(`I rebooted, triggering a bump reminder now.`);
			await bumpChannel.send(notifMessage);
		} else {
			// BUMP_COOLDOWN after the latest message.
			const rebootCooldown = BUMP_COOLDOWN - timeSinceLastMessage;
			LOGGER.event.debug(`I rebooted, triggering a bump reminder in ${rebootCooldown / 60_000}min.`);
			setTimeout(async () => {
				if (!BOOT_NOTIFICATION_SETTINGS.should) return;

				await bumpChannel.send(notifMessage);
			}, rebootCooldown);
		}
	},
};
