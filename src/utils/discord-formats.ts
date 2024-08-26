import type { GuildChannel, GuildEmoji, Role, User } from 'discord.js';

// Dates
export const DatetoDiscordDate = (date: Date): string => `<t:${date.getTime() / 1000}:R>`;
export const DateTStoDiscordDate = (timestamp_sec: number): string => `<t:${timestamp_sec}:R>`;
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
