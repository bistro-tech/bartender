import { Bot } from '@bot';
import { ENV } from '@env';
import { LOGGER } from '@log';

try {
	await new Bot(ENV.TOKEN, ENV.CLIENT_ID).start();
} catch (err) {
	await LOGGER.unknown.fatal(`Unknown error: ${JSON.stringify(err)}`);
}
