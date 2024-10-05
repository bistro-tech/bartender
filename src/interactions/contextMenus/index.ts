import type {
	ContextMenuCommandBuilder,
	MessageContextMenuCommandInteraction,
	UserContextMenuCommandInteraction,
} from 'discord.js';
import { Collection } from 'discord.js';

import { Report } from './report';

export type ContextMenu = {
	data: ContextMenuCommandBuilder;
	execute: (
		interaction: UserContextMenuCommandInteraction | MessageContextMenuCommandInteraction,
	) => Promise<unknown>;
};

export const CONTEXT_MENUS_COLLECTION = new Collection([Report].map((c) => [c.data.name, c]));
