import type {
	ContextMenuCommandBuilder,
	ContextMenuCommandInteraction,
	MessageContextMenuCommandInteraction,
	UserContextMenuCommandInteraction,
	WrapBooleanCache,
} from 'discord.js';

import { REPORT } from './report';

export type SpecificContextMenu<Kind extends ContextMenuCommandInteraction['commandType']> = {
	/**
	 * Use this type when setting the trigger prop.
	 * @typedef {import('discord.js').ApplicationCommandType}
	 * Only variant `Message` & `User` are authorized.
	 */
	readonly kind: Kind;
	readonly data: ContextMenuCommandBuilder;
	readonly execute: (interaction: Extract<CachedContextMenuKinds, { commandType: Kind }>) => Promise<unknown>;
};

export type ContextMenu = {
	[Type in ContextMenuCommandInteraction['commandType']]: SpecificContextMenu<Type>;
}[ContextMenuCommandInteraction['commandType']];

export const CONTEXT_MENUS: Array<ContextMenu> = [REPORT];

// These types aren't provided by discord.js.
type CachedContextMenuKinds =
	| UserContextMenuCommandInteraction<WrapBooleanCache<true>>
	| MessageContextMenuCommandInteraction<WrapBooleanCache<true>>;
