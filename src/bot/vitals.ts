import { ENV } from '@env';
import { LOGGER } from '@log';
import type { CategoryChannel, Guild, GuildTextBasedChannel, Role } from 'discord.js';
import { ChannelType } from 'discord.js';

export class Vitals {
	/* Channels */
	public readonly bumpChannel: GuildTextBasedChannel;
	public readonly moderationChannel: GuildTextBasedChannel;
	public readonly ticketInit: GuildTextBasedChannel;
	/* Roles */
	public readonly bumpRole: Role;
	/* Channels */
	public readonly ticketCategory: CategoryChannel;

	constructor(public readonly server: Guild) {
		/* Channels */
		this.bumpChannel = this.getTextChannelOrFail(ENV.BUMP_CHANNEL_ID);
		this.moderationChannel = this.getTextChannelOrFail(ENV.MODERATION_CHANNEL_ID);
		this.ticketInit = this.getTextChannelOrFail(ENV.TICKET_INIT_CHANNEL_ID);
		/* Roles */
		this.bumpRole = this.getRoleOrFail(ENV.BUMP_NOTIFICATION_ROLE_ID);
		/* Categories */
		this.ticketCategory = this.getCategoryOrFail(ENV.TICKET_CATEGORY_ID);
	}

	private getRoleOrFail(id: string): Role {
		const role = this.server.roles.cache.get(id);
		if (!role) return LOGGER.internal.fatal(`Couldn't find role with ID: ${id}.`);
		return role;
	}

	private getTextChannelOrFail(id: string): GuildTextBasedChannel {
		const channel = this.server.channels.cache.get(id);
		if (!channel) return LOGGER.internal.fatal(`Couldn't find channel with ID: ${id}.`);
		if (!channel.isTextBased()) return LOGGER.internal.fatal(`Channel ${id} isn't text based.`);
		return channel;
	}

	private getCategoryOrFail(id: string): CategoryChannel {
		const channel = this.server.channels.cache.get(id);
		if (!channel) return LOGGER.internal.fatal(`Couldn't find channel with ID: ${id}.`);
		if (channel.type !== ChannelType.GuildCategory) return LOGGER.internal.fatal(`Channel ${id} isn't a category.`);
		return channel;
	}
}
