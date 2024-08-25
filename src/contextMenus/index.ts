import type { ContextMenuCommandBuilder, ContextMenuCommandInteraction } from 'discord.js';
import { Collection } from 'discord.js';

import { Report } from './report';

export type ContextMenu = {
    data: ContextMenuCommandBuilder;
    execute: (interaction: ContextMenuCommandInteraction) => Promise<unknown>;
};

export const CONTEXT_MENUS_COLLECTION = new Collection([Report].map((c) => [c.data.name, c]));
