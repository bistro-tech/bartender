import type { ClientEvents } from 'discord.js';

import { INTERACTION_HANDLER } from './interactionHandler';
import { BUMP_DETECTOR } from './messageCreate/bumpDetector';
import { BUMP_RECOVER } from './ready/bumpRecover';
import { SETUP_TICKETS_SYSTEM } from './ready/setupTickets';
import { SHOUTOUT } from './ready/shoutout';

export type BotEvent = {
	[Event in keyof ClientEvents]: {
		readonly name: string;
		readonly kind: Event;
		readonly once: boolean;
		readonly execute: (...args: ClientEvents[Event]) => Awaitable<void>;
	};
}[keyof ClientEvents];

export const EVENTS: Array<BotEvent> = [
	// ready
	SHOUTOUT,
	SETUP_TICKETS_SYSTEM,
	BUMP_RECOVER,
	// interactionCreate
	INTERACTION_HANDLER,
	// messageCreate
	BUMP_DETECTOR,
];
