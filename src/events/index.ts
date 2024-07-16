import type { ClientEvents } from 'discord.js';

import { COMMAND_HANDLER } from './commandHandler';
import { READY } from './ready';

export type BotEvent = {
    [Event in keyof ClientEvents]: {
        readonly name: string;
        readonly kind: Event;
        readonly once: boolean;
        readonly execute: (...args: ClientEvents[Event]) => Awaitable<void>;
    };
}[keyof ClientEvents];

export const EVENTS: Array<BotEvent> = [READY, COMMAND_HANDLER];
