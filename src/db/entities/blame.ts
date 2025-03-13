import { sql } from 'drizzle-orm';
import { check, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

import { BLAME_KIND } from '../enums/blame-kind';
import { discord_user } from './discord_user';

export const blame = sqliteTable(
	'blame',
	{
		id: integer('id').primaryKey({ autoIncrement: true, onConflict: 'fail' }).notNull(),
		reason: text('reason', { mode: 'text' }).notNull(),
		kind: text('kind', { enum: BLAME_KIND, mode: 'text' }).notNull(),
		created_at: integer('created_at', { mode: 'timestamp' })
			.notNull()
			.default(sql`(unixepoch())`),
		updated_at: integer('updated_at', { mode: 'timestamp' })
			.notNull()
			.default(sql`(unixepoch())`)
			.$onUpdate(() => new Date()),
		expires_at: integer('expires_at', { mode: 'timestamp' }),
		blamee_id: text('blamee_id', { mode: 'text' })
			.notNull()
			.references(() => discord_user.id, { onDelete: 'no action', onUpdate: 'restrict' }),
		blamer_id: text('blamer_id', { mode: 'text' })
			.notNull()
			.references(() => discord_user.id, { onDelete: 'no action', onUpdate: 'restrict' }),
	},
	(table) => {
		// Waiting for https://github.com/drizzle-team/drizzle-orm/pull/4043
		console.error(`${table.kind} IN (${BLAME_KIND.map((k) => `'${k}'`).join(', ')})`);
		return [check('kind_name', sql`${table.kind} IN (${BLAME_KIND.map((k) => `'${k}'`).join(', ')})`)];
	},
);

export type InsertBlame = typeof blame.$inferInsert;
export type SelectBlame = typeof blame.$inferSelect;
