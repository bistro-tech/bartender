import type { Bot } from '@bot';
import { Collection, type MappedInteractionTypes } from 'discord.js';

import { CREATE_TICKET } from './createTicket';

export type Collector = {
	[Type in keyof MappedInteractionTypes]: {
		/**
		 * Use this type when setting the trigger prop.
		 * @typedef {import('discord.js').ComponentType}
		 */
		readonly trigger: Type;
		readonly customID: string;
		readonly execute: (bot: Bot, interaction: MappedInteractionTypes<true>[Type]) => Promise<unknown>;
	};
}[keyof MappedInteractionTypes];

export const COLLECTORS_COLLECTION = new Collection([CREATE_TICKET].map((c) => [c.customID, c]));
