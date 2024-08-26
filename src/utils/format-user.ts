import type { User } from 'discord.js';

/**
 * Formats a discord user for logging
 * @param {User} user the user to log
 * @returns {string} String representation of the user
 */
export function formatUser({ id: userID, tag: userTag }: User): string {
	return `${userTag}(${userID})`;
}
