import { Bot } from '@bot';
import type { Command } from '@commands';
import { STAGING_DEFAULT } from '@commands';
import type { BotEvent } from '@events';
import { LOGGER } from '@log';
import { interactionTypeToString } from '@utils/discord';
import { isGuildMember } from '@utils/discord-discriminants';
import type { ChatInputCommandInteraction } from 'discord.js';

/**
 * @listensTo   - interactionCreate
 * @description - Used to handle bot's commands.
 */
export const COMMAND_HANDLER: BotEvent = {
    name: 'Command Handler',
    kind: 'interactionCreate',
    once: false,
    async execute(interaction) {
        if (!Bot.isBot(interaction.client)) return LOGGER.event.fatal('Client is not a Bot. WTF?');
        if (!interaction.isCommand())
            return LOGGER.event.debug(`'${interactionTypeToString(interaction.type)}' is not a command.`);

        const {
            commandName,
            user: { id: userID, tag: userTag },
        } = interaction;
        const user = `${userTag}(${userID})`;

        if (!interaction.inGuild()) return LOGGER.event.error(`'${commandName}' not executed in a guild by ${user}.`);
        if (!interaction.isChatInputCommand()) return LOGGER.event.debug(`'${commandName}' is not a command.`);

        const command = interaction.client.COMMANDS.get(commandName);
        if (!command) return LOGGER.event.debug(`${commandName}: command not found.`);

        if (!stagingFilter(interaction, command)) {
            await LOGGER.event.debug(`${user} tried running '${commandName}' which is still in staging.`);
            await interaction.reply("This command isn't available right now.");
            return;
        }

        await LOGGER.event.debug(`user ${user} executed '${interaction.toString()}'`);
        await command.execute(interaction);
    },
};

/**
 * Checks if the given command can be run.
 * @param {ChatInputCommandInteraction<'raw' | 'cached'>} interaction The command we want to run
 * @param {Command} cmd The command we want to run
 * @returns {boolean} `true` when we can run the command.
 */
function stagingFilter(interaction: ChatInputCommandInteraction<'raw' | 'cached'>, cmd: Command): boolean {
    if (!cmd.options.staging) return true;

    const { channelId, member: author } = interaction;

    const stagingOpt = cmd.options.staging === 'default-options' ? STAGING_DEFAULT : cmd.options.staging;
    const roleIDs = isGuildMember(author) ? author.roles.cache.map(({ id }) => id) : author.roles;

    if (!stagingOpt.ALLOWED_ROLES.some((id) => roleIDs.includes(id))) return false;
    if (!stagingOpt.ALLOWED_CHANNELS.includes(channelId)) return false;

    return true;
}
