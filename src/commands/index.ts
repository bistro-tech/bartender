import { ENV } from '@env';
import type { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { Collection } from 'discord.js';

import { PING } from './ping';

type SlashCommandDescriptor =
    | SlashCommandBuilder
    | StrictOmit<SlashCommandBuilder, 'addSubcommand' | 'addSubcommandGroup'>;

export type Command = {
    readonly data: SlashCommandDescriptor;
    readonly options: {
        staging?: 'default-options' | StagingOptions;
    };
    readonly execute: (interaction: ChatInputCommandInteraction) => Awaitable<unknown>;
};

type StagingOptions = {
    readonly ALLOWED_ROLES: NonEmptyArray<`${number}`>;
    readonly ALLOWED_CHANNELS: NonEmptyArray<`${number}`>;
};

export const STAGING_DEFAULT: StagingOptions = ENV.STAGING_DEFAULT;
export const COMMANDS_COLLECTION = new Collection([PING].map((c) => [c.data.name, c]));
