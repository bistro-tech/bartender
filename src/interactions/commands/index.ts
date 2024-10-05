import type { ChatInputCommandInteraction, SlashCommandOptionsOnlyBuilder } from 'discord.js';
import { Collection } from 'discord.js';

import { LIST_BLAMES } from './list-blames';
import { PING } from './ping';
import { WARN } from './warn';

export type Command = {
	readonly data: SlashCommandOptionsOnlyBuilder;
	readonly execute: (interaction: ChatInputCommandInteraction) => Promise<unknown>;
};

export const COMMANDS_COLLECTION = new Collection([PING, LIST_BLAMES, WARN].map((c) => [c.data.name, c]));
