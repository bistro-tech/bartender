import { getInteractionDetails, getInteractionIdentifier } from '@utils/discord-interaction';
import type { EmbedBuilder, Interaction } from 'discord.js';

import { Loggable } from '.';

export class InteractionLog extends Loggable {
	public readonly kind = 'INTERACTION';

	public override toEmbed(): EmbedBuilder {
		return super
			.toEmbed()
			.setFields([
				{
					name: `\`${getInteractionIdentifier(this.interaction)}\``,
					value: `\`${getInteractionDetails(this.interaction)}\``,
					inline: false,
				},
			])
			.setFooter({ text: `By: ${this.interaction.user.toString()}` });
	}

	constructor(
		public readonly severity: Loggable['severity'],
		private readonly interaction: Interaction,
		public readonly message: string,
	) {
		super();
	}
}
