import { ENV } from '@env';
import type { BotEvent } from '@events';
import { LOGGER } from '@log';

const TWO_HOURS = 7_200_000;

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
        if (message.interaction?.commandName != 'bump') return;

        void LOGGER.event.debug(`Next bump reminder at ${new Date(new Date().getTime() + TWO_HOURS).toLocaleString()}`);
        setTimeout(async () => {
            await message.channel.send(`<@&${ENV.BUMP_NOTIFICATION_ROLE_ID}> Il est temps de bump le serveur !`);
        }, TWO_HOURS);
    },
};
