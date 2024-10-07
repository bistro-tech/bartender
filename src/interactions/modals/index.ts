import type { If, ModalMessageModalSubmitInteraction, ModalSubmitInteraction } from 'discord.js';

import { REPORT } from './report';

export type Modal<FromMessage extends boolean = boolean> = {
	readonly customID: string;
	readonly execute: (
		interaction: If<FromMessage, ModalMessageModalSubmitInteraction<'cached'>, ModalSubmitInteraction<'cached'>>,
	) => Promise<unknown>;
};

export const MODALS_LISTENERS: Array<Modal> = [REPORT];
