import { ENV } from '@env';
import type { BotEvent } from '@events';
import { LOGGER } from '@log';
import { TICKET_KIND, TICKET_MENU_ID, TiketKindStringSelectOption } from '@utils/tickets';
import {
	ActionRowBuilder,
	type MessageCreateOptions,
	StringSelectMenuBuilder,
	StringSelectMenuOptionBuilder,
} from 'discord.js';

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
			return LOGGER.event.error(`Could not find bump channel (${ENV.TICKET_INIT_CHANNEL_ID}) upon boot !`);
		if (!ticketSetupChannel.isTextBased())
			return LOGGER.event.error(`Bump channel (${ENV.TICKET_INIT_CHANNEL_ID}) is not text based ??`);

		const [lastMessage] = await ticketSetupChannel.messages.fetch({ limit: 1 });
		const setupMessageExists = lastMessage?.[1].components /* rows */
			.some(({ components }) => components.some(({ customId }) => customId === TICKET_MENU_ID));

		if (setupMessageExists) return LOGGER.event.debug('Ticket dropdown message already exists.');
		await ticketSetupChannel.send(TicketMenuMessage);
	},
};

const TicketMenuMessage: MessageCreateOptions = ((): MessageCreateOptions => {
	const dropdown = new StringSelectMenuBuilder()
		.setCustomId(TICKET_MENU_ID)
		.setPlaceholder('Choisis le type de ticket!')
		.addOptions(
			...TICKET_KIND.map(TiketKindStringSelectOption),
			// Special case for those who think tickets are for help.
			new StringSelectMenuOptionBuilder()
				.setLabel('HELP')
				.setValue('HELP')
				.setDescription("J'ai besoin d'aide pour du code/mon pc etc..."),
		);

	const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(dropdown);
	return {
		content: `
		Nous sommes la pour t'aider,
		Pour quelle raison souhaites tu ouvrir un ticket?
		`,
		components: [row],
	};
})();
