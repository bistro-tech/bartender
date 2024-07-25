import { ENV } from '@env';
import { Database } from 'bun:sqlite';
import { drizzle } from 'drizzle-orm/bun-sqlite';

const sqlite = new Database(ENV.DATABASE_FILENAME);

export const DB = drizzle(sqlite);
