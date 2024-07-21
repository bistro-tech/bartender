import { ConsoleColor } from '@utils/console-colors';
import type { ColorResolvable } from 'discord.js';
import { EmbedBuilder } from 'discord.js';

const LoggableSymbol = Symbol('Loggable');
export abstract class Loggable {
    public abstract readonly message: string;
    public abstract readonly kind: 'COMMAND' | `INTERNAL` | 'EVENT' | 'UNKNOWN' | 'CONTEXT_MENU';
    public abstract readonly severity: 'DEBUG' | 'INFO' | 'WARN' | 'ERROR' | 'FATAL';

    private readonly [LoggableSymbol] = true;
    static isLoggable(err: unknown): err is Loggable {
        return (err as Loggable)[LoggableSymbol];
    }

    public toEmbed(): EmbedBuilder {
        return new EmbedBuilder()
            .setTitle('A problem occured.')
            .setColor(this.embed_color)
            .setAuthor({ name: this.kind })
            .setDescription(this.message);
    }

    protected get embed_color(): ColorResolvable {
        switch (this.severity) {
            case 'DEBUG':
                return 'LightGrey';
            case 'INFO':
                return 'Blue';
            case 'WARN':
                return 'Orange';
            case 'ERROR':
            case 'FATAL':
                return 'Red';
        }
    }

    public get console_color(): ConsoleColor {
        switch (this.severity) {
            case 'DEBUG':
                return ConsoleColor.FgCyan;
            case 'INFO':
                return ConsoleColor.FgBlue;
            case 'WARN':
                return ConsoleColor.FgYellow;
            case 'ERROR':
            case 'FATAL':
                return ConsoleColor.FgRed;
        }
    }

    public get quiet(): boolean {
        switch (this.severity) {
            case 'DEBUG':
            case 'INFO':
            case 'WARN':
                return true;
            case 'ERROR':
            case 'FATAL':
                return false;
        }
    }
}
