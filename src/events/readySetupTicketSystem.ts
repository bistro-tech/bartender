import { ENV } from '@env';
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
		const server = client.guilds.cache.get(ENV.SERVER_ID);
		if (!server) return LOGGER.event.fatal(`Client doesn't have access to guild ${ENV.SERVER_ID}`);

		const ticketSetupChannel = await server.channels.fetch(ENV.TICKET_INIT_CHANNEL_ID);
		if (!ticketSetupChannel)
			return LOGGER.event.error(`Could not find Ticket init channel (${ENV.TICKET_INIT_CHANNEL_ID}) upon boot !`);
		if (!ticketSetupChannel.isTextBased())
			return LOGGER.event.error(`Ticket init channel (${ENV.TICKET_INIT_CHANNEL_ID}) is not text based ??`);

		const [lastMessage] = await ticketSetupChannel.messages.fetch({ limit: 1 });
		const setupMessageExists = lastMessage?.[1].components /* rows */
			.some(({ components }) => components.some(({ customId }) => customId === TICKET_MENU_ID));

		if (setupMessageExists) return LOGGER.event.debug('Ticket dropdown message already exists.');
		await ticketSetupChannel.send(TicketMenuMessage);
	},
};
