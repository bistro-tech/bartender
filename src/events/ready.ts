import type { BotEvent } from '@events';
import { LOGGER } from '@log';

/**
 * @listensTo   - ready
 * @description - Emitted when the client becomes ready to start working.
 */
export const READY: BotEvent = {
	name: 'Ready shoutout',
	kind: 'ready',
	once: true,
	execute: (client) => LOGGER.event.debug(`Logged in as ${client.user.tag}!`),
};
