import { InteractionType } from 'discord.js';

/**
 * @param {InteractionType} type the interaction.type
 * @returns {string} String representation of the interaction type
 */
export function interactionTypeToString(type: InteractionType): string {
    switch (type) {
        case InteractionType.Ping:
            return 'Ping';
        case InteractionType.ApplicationCommand:
            return 'ApplicationCommand';
        case InteractionType.MessageComponent:
            return 'MessageComponent';
        case InteractionType.ApplicationCommandAutocomplete:
            return 'ApplicationCommandAutocomplete';
        case InteractionType.ModalSubmit:
            return 'ModalSubmit';
    }
}
