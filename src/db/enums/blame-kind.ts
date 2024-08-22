export const BLAME_KIND = ['BAN', 'WARN', 'KICK', 'TIMEOUT'] as const;
export type BLAME_KIND = (typeof BLAME_KIND)[number];

export const blameKindEmote = (kind: BLAME_KIND): string => {
	switch (kind) {
		case 'BAN':
			return '🔨';
		case 'WARN':
			return '⚠️';
		case 'KICK':
			return '🚪';
		case 'TIMEOUT':
			return '🔇';
	}
};
