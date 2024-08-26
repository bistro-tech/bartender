import type { GuildChannel, GuildEmoji, Role, User } from 'discord.js';

const DateFormatOptions = {
	default: '',
	'short-time': ':t',
	'long-time': ':T',
	'short-date': ':d',
	'long-date': ':D',
	'short-date-time': ':f',
	'long-date-time': ':F',
	'relative-time': ':R',
} as const;
type DateFormatOptions = keyof typeof DateFormatOptions;

// Dates
export const dateToDiscordDate = (date: Date, format: DateFormatOptions = 'default'): string =>
	`<t:${(date.getTime() / 1000) | 0}${DateFormatOptions[format]}>`;
export const timestampSecToDiscordDate = (timestamp_sec: number, format: DateFormatOptions = 'default'): string =>
	`<t:${timestamp_sec}${DateFormatOptions[format]}>`;
// User pings
export const userToPing = (user: User): string => `<@${user.id}>`;
export const userIDToPing = (id: string): string => `<@${id}>`;
// Role pings
export const roleToPing = (role: Role): string => `<@&${role.id}>`;
export const roleIDToPing = (id: string): string => `<@&${id}>`;
// Channel mentions
export const channelToPing = (channel: GuildChannel): string => `<#${channel.id}>`;
export const channelIDToPing = (id: string): string => `<#${id}>`;
// Emojis
export const emojiToPing = (emoji: GuildEmoji): string => `<:_:${emoji.id}>`;
export const emojiIDToPing = (id: string): string => `<:_:${id}>`;
