import {
	ActionRowBuilder,
	type MessageCreateOptions,
	StringSelectMenuBuilder,
	StringSelectMenuOptionBuilder,
} from 'discord.js';

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

export const TicketMenuMessage = {
	content: `
		Nous sommes la pour t'aider,
		Pour quelle raison souhaites-tu ouvrir un ticket?
	`,
	components: [
		new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
			new StringSelectMenuBuilder()
				.setCustomId(TICKET_MENU_ID)
				.setPlaceholder('Choisis le type de ticket!')
				.addOptions(
					...TICKET_KIND.map(TiketKindStringSelectOption),
					// Special case for those who think tickets are for help.
					new StringSelectMenuOptionBuilder()
						.setLabel('HELP')
						.setValue('HELP')
						.setDescription("J'ai besoin d'aide pour du code/mon pc etc..."),
				),
		),
	],
} as const satisfies MessageCreateOptions;
