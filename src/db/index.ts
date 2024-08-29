import * as schema from '@db/schema';
import { ENV } from '@env';
import { LOGGER } from '@log';
import { Database } from 'bun:sqlite';
import { drizzle } from 'drizzle-orm/bun-sqlite';
import { migrate } from 'drizzle-orm/bun-sqlite/migrator';

// Init the connection to the DB
const sqlite = new Database(ENV.DATABASE_FILENAME, { strict: true, create: false });

// Enable some non-persistant constraints & settings
sqlite.run(`
    -- Enforces checks on foreign keys (FKs must exist in the referenced table)
    PRAGMA foreign_keys = ON;

    -- Ensures the database is fully synchronized with disk for durability
    PRAGMA synchronous = FULL;

    -- Stores temporary tables and indices in memory for faster operations
    PRAGMA temp_store = MEMORY;

    -- Sets the cache size to 2MB to improve read performance
    PRAGMA cache_size = -2000;

    -- Makes the LIKE operator case-sensitive
    PRAGMA case_sensitive_like = ON;

    -- Allows SQLite to automatically create indices to optimize queries
    PRAGMA automatic_index = ON;

    -- Runs a full optimization of the database based on current usage
    PRAGMA optimize;
`);

// Create the drizzle connector
const DB = drizzle(sqlite, {
	schema,
	logger: {
		logQuery: (query, params) =>
			LOGGER.internal.debug(params.length ? `${query} with params (${params.toString()})` : query),
	},
});

// Run migrations
migrate(DB, { migrationsFolder: './migrations' });

export { DB };
