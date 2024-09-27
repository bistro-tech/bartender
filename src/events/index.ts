import type { ClientEvents } from 'discord.js';

import { COLLECTOR_HANDLER } from './collectorHandler';
import { COMMAND_HANDLER } from './commandHandler';
import { CONTEXT_MENU_HANDLER } from './contextMenuHandler';
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
	MESSAGE_BUMP,
	COMMAND_HANDLER,
	CONTEXT_MENU_HANDLER,
	READY_SETUP_TICKETS_SYSTEM,
	READY_BUMP_RECOVER,
	COLLECTOR_HANDLER,
];
