import { Bot } from '@bot';
import type { BotEvent } from '@events';
import { LOGGER } from '@log';
import { TICKET_MENU_ID, TicketMenuMessage } from '@utils/tickets';

/**
 * @listensTo   - ready
 * @description - Creates the message & menu used for tickets creation.
 */
export const READY_SETUP_TICKETS_SYSTEM: BotEvent = {
	name: 'Ready setup ticket system',
	kind: 'ready',
	once: true,
	execute: async (client) => {
		if (!Bot.isBot(client)) return LOGGER.event.fatal('Client is not a Bot. WTF?');
		const ticketSetupChannel = client.vitals.ticketInit;

		const [lastMessage] = await ticketSetupChannel.messages.fetch({ limit: 1 });
		const setupMessageExists = lastMessage?.[1].components /* rows */
			.some(({ components }) => components.some(({ customId }) => customId === TICKET_MENU_ID));

		if (setupMessageExists) return LOGGER.event.debug('Ticket dropdown message already exists.');
		await ticketSetupChannel.send(TicketMenuMessage);
	},
};
