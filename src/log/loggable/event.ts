import { Loggable } from '.';

export class EventLog extends Loggable {
    public readonly kind = 'EVENT';
    constructor(
        public readonly severity: Loggable['severity'],
        public readonly message: string,
    ) {
        super();
    }
}
