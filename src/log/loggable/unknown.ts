import { Loggable } from '.';

export class UnknownLog extends Loggable {
    public readonly kind = 'UNKNOWN';
    public readonly severity = 'FATAL';
    constructor(public readonly message: string) {
        super();
    }
}
