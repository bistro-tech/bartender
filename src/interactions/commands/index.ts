import type { ChatInputCommandInteraction, SlashCommandOptionsOnlyBuilder } from 'discord.js';

import { LIST_BLAMES } from './list-blames';
import { PING } from './ping';
import { WARN } from './warn';

export type Command = {
	readonly data: SlashCommandOptionsOnlyBuilder;
	readonly execute: (interaction: ChatInputCommandInteraction<'cached'>) => Promise<unknown>;
	readonly canRun?: (interaction: ChatInputCommandInteraction<'cached'>) => boolean;
};

export const COMMANDS: Array<Command> = [PING, LIST_BLAMES, WARN];
