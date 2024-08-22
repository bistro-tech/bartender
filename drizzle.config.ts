import { defineConfig } from 'drizzle-kit';
import * as v from 'valibot';

const ENV = v.parse(v.object({ DATABASE_FILENAME: v.string() }), process.env);

export default defineConfig({
	dialect: 'sqlite',
	dbCredentials: {
		url: ENV.DATABASE_FILENAME,
	},
	/* Code */
	schema: './src/db/schema.ts',
	out: './migrations',
	/* Additional options */
	verbose: true,
	strict: true,
});
