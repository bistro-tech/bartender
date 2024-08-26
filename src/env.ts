import * as v from 'valibot';
v.setGlobalConfig({ abortPipeEarly: true });

const DISCORD_ID_RE = /^\d{17,19}$/;

const ENV_SCHEMA = v.pipeAsync(
	v.objectAsync({
		CLIENT_ID: v.pipe(
			v.string('Expected `CLIENT_ID` to be a string.'),
			v.regex(DISCORD_ID_RE, 'Expected `CLIENT_ID` to be a discord id.'),
		),
		SERVER_ID: v.pipe(
			v.string('Expected `SERVEUR_ID` to be a string.'),
			v.regex(DISCORD_ID_RE, 'Expected `SERVEUR_ID` to be a discord id.'),
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
		BUMP_NOTIFICATION_ROLE_ID: v.pipe(
			v.string('Expected `BUMP_NOTIFICATION_ROLE_ID` to be a string.'),
			v.regex(DISCORD_ID_RE, 'Expected `BUMP_NOTIFICATION_ROLE_ID` to be a discord id.'),
		),
		MODERATION_CHANNEL_ID: v.pipe(
			v.string('Expected `MODERATION_CHANNEL_ID` to be a string.'),
			v.regex(DISCORD_ID_RE, 'Invalid channel id.'),
		),
	}),
	v.readonly(),
);

export const ENV = await v.parseAsync(ENV_SCHEMA, process.env);
export type ENV = v.InferOutput<typeof ENV_SCHEMA>;
