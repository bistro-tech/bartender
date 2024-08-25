import { Loggable } from '.';

export class InternalLog extends Loggable {
	public readonly kind = 'INTERNAL';

	constructor(
		public readonly severity: Loggable['severity'],
		public readonly message: string,
	) {
		super();
	}
}
