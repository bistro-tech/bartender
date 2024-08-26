import type { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { Collection } from 'discord.js';

import { PING } from './ping';

type SlashCommandDescriptor =
	| SlashCommandBuilder
	| StrictOmit<SlashCommandBuilder, 'addSubcommand' | 'addSubcommandGroup'>;

export type Command = {
	readonly data: SlashCommandDescriptor;
	readonly execute: (interaction: ChatInputCommandInteraction) => Promise<unknown>;
};

export const COMMANDS_COLLECTION = new Collection([PING].map((c) => [c.data.name, c]));
