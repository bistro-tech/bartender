import * as v from 'valibot';

v.setGlobalConfig({ abortPipeEarly: true });

const ENV_SCHEMA = v.pipeAsync(
    v.objectAsync({
        CLIENT_ID: v.pipe(
            v.string('Expected `CLIENT_ID` to be a string.'),
            v.regex(/^\d{17,19}$/, 'Expected `CLIENT_ID` to be a discord id.'),
        ),
        SERVER_ID: v.pipe(
            v.string('Expected `SERVEUR_ID` to be a string.'),
            v.regex(/^\d{17,19}$/, 'Expected `SERVEUR_ID` to be a discord id.'),
        ),
        TOKEN: v.pipe(
            v.string('Expected `TOKEN` to be a string.'),
            v.regex(/^(mfa\.[\w-]{84}|[\w-]{24,}\.[\w-]{6}\.[\w-]{27,})$/, 'Expected `TOKEN` to be discord bot token.'),
        ),
        WEBHOOK_LOG_URL: v.optionalAsync(
            v.pipeAsync(
                v.string('Expected `WEBHOOK_LOG_URL` to be a string.'),
                v.regex(
                    /^https:\/\/(?:discord|discordapp)\.com\/api\/webhooks\/\d{17,19}\/[\w-]*$/,
                    'Expected `WEBHOOK_LOG_URL` to be a discord webhook url.',
                ),
                v.checkAsync((url) => fetch(url).then((r) => r.ok), 'Invalid `WEBHOOK_LOG_URL` url.'),
            ),
        ),
        // Staging config //
        STAGING_ALLOWED_ROLES: v.pipe(
            v.string('Expected `STAGING_ALLOWED_ROLES` to be a string.'),
            v.regex(/^(?:\d{17,19})(?:,? ?\d{17,19})*$/, 'Expected non-empty list of discord IDs separated by commas.'),
            v.transform((s) => s.split(/, ?/)),
        ),
        STAGING_ALLOWED_CHANNELS: v.pipe(
            v.string('Expected `STAGING_ALLOWED_CHANNELS` to be a string.'),
            v.regex(/^(?:\d{17,19})(?:,? ?\d{17,19})*$/, 'Expected non-empty list of discord IDs separated by commas.'),
            v.transform((s) => s.split(/, ?/)),
        ),
    }),
    v.transform((env) => ({
        CLIENT_ID: env.CLIENT_ID,
        SERVER_ID: env.SERVER_ID,
        TOKEN: env.TOKEN,
        WEBHOOK_LOG_URL: env.WEBHOOK_LOG_URL,
        STAGING_DEFAULT: {
            ALLOWED_ROLES: env.STAGING_ALLOWED_ROLES as NonEmptyArray<`${number}`>,
            ALLOWED_CHANNELS: env.STAGING_ALLOWED_CHANNELS as NonEmptyArray<`${number}`>,
        },
    })),
    v.readonly(),
);

export const ENV = await v.parseAsync(ENV_SCHEMA, process.env);
export type ENV = v.InferOutput<typeof ENV_SCHEMA>;
