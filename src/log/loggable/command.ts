import type { ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';

import { Loggable } from '.';

export class CommandLog extends Loggable {
    public readonly kind = 'COMMAND';

    public override toEmbed(): EmbedBuilder {
        return super
            .toEmbed()
            .setFields([
                {
                    name: 'Command executed',
                    value: `\`${this.interaction.toString()}\``,
                    inline: false,
                },
            ])
            .setFooter({ text: `By: ${this.interaction.user.toString()}` });
    }

    constructor(
        public readonly severity: Loggable['severity'],
        private readonly interaction: ChatInputCommandInteraction,
        public readonly message: string,
    ) {
        super();
    }
}
