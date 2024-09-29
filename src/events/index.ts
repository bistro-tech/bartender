import type { ClientEvents } from 'discord.js';

import { INTERACTION_HANDLER } from './interactionHandler';
import { MESSAGE_BUMP } from './messageCreateBump';
import { READY } from './ready';
import { READY_BUMP_RECOVER } from './readyBumpRecover';
import { READY_SETUP_TICKETS_SYSTEM } from './readySetupTicketSystem';

export type BotEvent = {
	[Event in keyof ClientEvents]: {
		readonly name: string;
		readonly kind: Event;
		readonly once: boolean;
		readonly execute: (...args: ClientEvents[Event]) => Awaitable<void>;
	};
}[keyof ClientEvents];

export const EVENTS: Array<BotEvent> = [
	READY,
	INTERACTION_HANDLER,
	MESSAGE_BUMP,
	READY_SETUP_TICKETS_SYSTEM,
	READY_BUMP_RECOVER,
];
