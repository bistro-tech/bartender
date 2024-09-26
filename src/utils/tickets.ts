import { StringSelectMenuOptionBuilder } from 'discord.js';

export const TICKET_MENU_ID = 'TICKET_KIND_SELECTOR';
export const TICKET_KIND = ['PARTNER', 'PROBLEM', 'APPLY', 'OTHER'] as const;
export type TICKET_KIND = (typeof TICKET_KIND)[number];

export const TiketKindStringSelectOption = (kind: TICKET_KIND): StringSelectMenuOptionBuilder => {
	switch (kind) {
		case 'OTHER':
			return new StringSelectMenuOptionBuilder()
				.setLabel('Autre')
				.setDescription('Aucune des autres options.')
				.setValue(kind);
		case 'PARTNER':
			return new StringSelectMenuOptionBuilder()
				.setLabel('Partenariat')
				.setDescription('Je souhaite proposer un partenariat.')
				.setValue(kind);
		case 'APPLY':
			return new StringSelectMenuOptionBuilder()
				.setLabel('Candidature')
				.setDescription('Je souhaiterai rejoindre le staff.')
				.setValue(kind);
		case 'PROBLEM':
			return new StringSelectMenuOptionBuilder()
				.setLabel('Soucis avec le serveur')
				.setDescription('Tu as un soucis avec le serveur, un membre ou similaire.')
				.setValue(kind);
	}
};
