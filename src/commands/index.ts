import type { ChatInputCommandInteraction, SlashCommandOptionsOnlyBuilder } from 'discord.js';
import { Collection } from 'discord.js';

import { PING } from './ping';

export type Command = {
	readonly data: SlashCommandOptionsOnlyBuilder;
	readonly execute: (interaction: ChatInputCommandInteraction) => Promise<unknown>;
};

export const COMMANDS_COLLECTION = new Collection([PING].map((c) => [c.data.name, c]));
