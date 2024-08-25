import { ENV } from '@env';
import { ConsoleColor } from '@utils/console-colors';
import { MessageFlags, WebhookClient } from 'discord.js';

import type { Loggable } from './loggable';
import { InternalLog } from './loggable/internal';

class Logger {
	private readonly WebHookClient: WebhookClient | undefined;

	constructor(WEBHOOK_URL: string | undefined) {
		if (WEBHOOK_URL) {
			this.WebHookClient = new WebhookClient({ url: WEBHOOK_URL });
		} else {
			this.log(new InternalLog('DEBUG', 'Webhook logging is disabled.'));
		}
	}

	public log(loggable: Loggable): void {
		const now = new Date();
		// eslint-disable-next-line no-console -- only allowed console.log
		console.log(
			`${loggable.console_color}[${now.toLocaleDateString()}, ${now.toLocaleTimeString().padStart(11)} - ${loggable.severity.padStart(5)} - ${loggable.kind.padStart(8)}] - ${loggable.message}${ConsoleColor.Reset}`,
		);
	}

	public async notifiant_log(loggable: Loggable): Promise<void> {
		this.log(loggable);
		await this.WebHookClient?.send({
			embeds: [loggable.toEmbed()],
			flags: loggable.quiet ? [MessageFlags.SuppressNotifications] : [],
		});
	}

	public exiting_log(loggable: Loggable): never {
		this.log(loggable);
		return process.exit(1);
	}
}

export const __LOGGER = new Logger(ENV.WEBHOOK_LOG_URL);
