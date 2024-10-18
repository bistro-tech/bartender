import { Bot } from '@bot';
import { ENV } from '@env';
import { LOGGER } from '@log';

try {
	await new Bot().start(ENV.TOKEN, ENV.SERVER_ID);
} catch (err) {
	await LOGGER.unknown.fatal(`Unknown error: ${JSON.stringify(err)}`);
}
