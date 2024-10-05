import type { MappedInteractionTypes } from 'discord.js';

import { CREATE_TICKET } from './ticketCreation';

export type SpecificListener<Type extends keyof MappedInteractionTypes> = {
	/**
	 * Use this type when setting the trigger prop.
	 * @typedef {import('discord.js').ComponentType}
	 */
	readonly trigger: Type;
	readonly customID: string;
	readonly execute: (interaction: MappedInteractionTypes<true>[Type]) => Promise<unknown>;
};

export type Listener = {
	[Type in keyof MappedInteractionTypes]: SpecificListener<Type>;
}[keyof MappedInteractionTypes];

export const LISTENERS: Array<Listener> = [CREATE_TICKET];
