import type { BotEvent } from '@events';

/**
 * @listensTo   - ready
 * @description - Emitted when the client becomes ready to start working.
 */
export const READY: BotEvent = {
    name: 'Ready shoutout',
    kind: 'ready',
    once: true,
    execute(client) {
        console.log(`Logged in as ${client.user.tag}!`);
    },
};
