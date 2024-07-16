import * as v from 'valibot';

v.setGlobalConfig({ abortPipeEarly: true });

const ENV_SCHEMA = v.pipe(
    v.object({
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
    }),
    v.readonly(),
);

export const ENV = v.parse(ENV_SCHEMA, process.env);
export type ENV = v.InferOutput<typeof ENV_SCHEMA>;
