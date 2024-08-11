import { ENV } from '@env';
import type { BotEvent } from '@events';

const TWO_HOURS = 7200000;

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
        if (message.interaction?.commandName == 'bump') {
            setTimeout(async () => {
                await message.channel.send(`<@&${ENV.BUMP_NOTIFICATION_ROLE_ID}> Il est temps de bump le serveur !`);
            }, TWO_HOURS);
        }
    },
};
