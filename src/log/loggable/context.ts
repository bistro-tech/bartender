import type { ContextMenuCommandInteraction, EmbedBuilder } from 'discord.js';

import { Loggable } from '.';

export class ContextLog extends Loggable {
    public readonly kind = 'CONTEXT_MENU';

    public override toEmbed(): EmbedBuilder {
        return super
            .toEmbed()
            .setFields([
                {
                    name: 'Context menu executed',
                    value: `\`${this.interaction.commandName}\``,
                    inline: false,
                },
            ])
            .setFooter({ text: `By: ${this.interaction.user.toString()}` });
    }

    constructor(
        public readonly severity: Loggable['severity'],
        private readonly interaction: ContextMenuCommandInteraction,
        public readonly message: string,
    ) {
        super();
    }
}
