import type { APIInteractionGuildMember, GuildMember } from 'discord.js';

/**
 * Checks if a member is a `GuildMember` type or not.
 * @param {GuildMember | APIInteractionGuildMember} member the object to test
 * @returns {boolean} `true` if `member` is an instance of `GuildMember`
 */
export function isGuildMember(member: GuildMember | APIInteractionGuildMember): member is GuildMember {
    const discriminent: FindDiscriminent<GuildMember, APIInteractionGuildMember> = 'client';
    return discriminent in member;
}
