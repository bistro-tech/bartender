import { __LOGGER } from './__logger';
import type { Loggable } from './loggable';
import { CommandLog } from './loggable/command';
import { EventLog } from './loggable/event';
import { InternalLog } from './loggable/internal';
import { UnknownLog } from './loggable/unknown';

export const LOGGER = {
    command: buildLogger(CommandLog),
    event: buildLogger(EventLog),
    internal: buildLogger(InternalLog),
    unknown: {
        fatal: (msg: string) => __LOGGER.log(new UnknownLog(msg)),
    },
} as const satisfies Record<string, Record<string, Fn<Promise<void>>>>;

/**
 * @ignore
 */
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type -- unable to express it properly
function buildLogger<T extends Constructor<Loggable>>(Loggable: T) {
    type Parameters = T extends new (severity: Loggable['severity'], ...args: infer P) => Loggable ? P : never;
    return {
        debug: (...args: Parameters): Promise<void> => __LOGGER.log(new Loggable('DEBUG', ...args)),
        info: (...args: Parameters): Promise<void> => __LOGGER.log(new Loggable('INFO', ...args)),
        warn: (...args: Parameters): Promise<void> => __LOGGER.log(new Loggable('WARN', ...args)),
        error: (...args: Parameters): Promise<void> => __LOGGER.log(new Loggable('ERROR', ...args)),
        fatal: (...args: Parameters): Promise<void> => __LOGGER.log(new Loggable('FATAL', ...args)),
    } as const;
}