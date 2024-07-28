import type { ClientEvents } from 'discord.js';

import { COMMAND_HANDLER } from './commandHandler';
import { MESSAGE_BUMP } from './messageCreateBump';
import { READY } from './ready';

export type BotEvent = {
    [Event in keyof ClientEvents]: {
        readonly name: string;
        readonly kind: Event;
        readonly once: boolean;
        readonly execute: (...args: ClientEvents[Event]) => Awaitable<void>;
    };
}[keyof ClientEvents];

export const EVENTS: Array<BotEvent> = [READY, MESSAGE_BUMP, COMMAND_HANDLER];
