import { Bot } from '@bot';
import { ENV } from '@env';

new Bot(ENV.TOKEN, ENV.CLIENT_ID).start().catch(console.error);
