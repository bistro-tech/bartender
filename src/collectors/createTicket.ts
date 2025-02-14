import { Bot } from '@bot';
import type { Collector } from '@collectors';
import { LOGGER } from '@log';
import { formatUser } from '@log/utils';
import { channelToPing } from '@utils/discord-formats';
import { type TICKET_KIND, TICKET_MENU_ID } from '@utils/tickets';
import { ChannelType, ComponentType, OverwriteType } from 'discord.js';

export const CREATE_TICKET: Collector = {
	customID: TICKET_MENU_ID,
	trigger: ComponentType.StringSelect,
	execute: async (interaction) => {
		if (!Bot.isBot(interaction.client)) return LOGGER.event.fatal('Client is not a Bot. WTF?');
		// HELP is a special case
		const [kind] = interaction.values as Array<TICKET_KIND | 'HELP'>;
		if (!kind) return LOGGER.event.fatal(`CREATE_TICKET without a kind??`);

		if (kind === 'HELP')
			return interaction.reply({
				content:
					"Pour toute demande d'aide je t'invite à ouvrir un poste dans le forum d'aide (et penses a lire le reglement du forum pour ne pas te faire taper sur les doigts) ^^.",
				ephemeral: true,
			});

		// <kind>-<username>-<3 random char> => because users can create multiple tickets at the same time
		const ticketName = `${kind.toLowerCase()}-${interaction.user.username}-${Math.random().toString(36).slice(2, 5)}`;
		LOGGER.internal.debug(`user ${formatUser(interaction.member.user)} requested the creation of ${ticketName}.`);

		const ticketChannel = await interaction.client.vitals.ticketCategory.children.create({
			name: ticketName,
			type: ChannelType.GuildText,
		});

		await ticketChannel.permissionOverwrites.edit(
			interaction.member,
			{
				ViewChannel: true,
			},
			{ reason: `${interaction.user.username} requested a ticket.`, type: OverwriteType.Member },
		);

		// Resets the dropdown to empty value
		await interaction.message.edit({ components: interaction.message.components });

		return interaction.reply({ content: `All good bro! ${channelToPing(ticketChannel)}`, ephemeral: true });
	},
};
