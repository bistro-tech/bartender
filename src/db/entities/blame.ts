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
	(_) => ({
		selfBlameCheck: check('self_blame_check', sql`'blamee_id' != 'blamer_id'`),
		kindCheck: check('blame_kind_check', sql`'kind' IN (${sql.join(BLAME_KIND.map(sql.identifier), sql`,`)})`),
	}),
);

export type InsertBlame = typeof blame.$inferInsert;
export type SelectBlame = typeof blame.$inferSelect;
