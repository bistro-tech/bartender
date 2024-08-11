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
            // ok to void since no webhook will be sent
            void this.log(new InternalLog('DEBUG', 'Webhook logging is disabled.'));
        }
    }

    public async log(loggable: Loggable): Promise<void> {
        // eslint-disable-next-line no-console -- only allowed console.log
        console.log(
            `${loggable.console_color}[${new Date().toLocaleString()} - ${loggable.severity.padStart(5)} - ${loggable.kind.padStart(8)}] - ${loggable.message}${ConsoleColor.Reset}`,
        );

        switch (loggable.severity) {
            case 'DEBUG':
                break;
            case 'INFO':
            case 'WARN':
            case 'ERROR':
            case 'FATAL':
                await this.WebHookClient?.send({
                    embeds: [loggable.toEmbed()],
                    flags: loggable.quiet ? [MessageFlags.SuppressNotifications] : [],
                });
        }
    }

    public async exiting_log(loggable: Loggable): Promise<never> {
        await this.log(loggable);
        return process.exit(1);
    }
}

export const __LOGGER = new Logger(ENV.WEBHOOK_LOG_URL);
