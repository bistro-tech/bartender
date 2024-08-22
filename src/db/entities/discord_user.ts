import { sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const discord_user = sqliteTable('user', {
	id: text('id', { mode: 'text' }).primaryKey(),
	display_name: text('display_name', { mode: 'text' }).notNull(),
});

export type InsertDiscordUser = typeof discord_user.$inferInsert;
export type SelectDiscordUser = typeof discord_user.$inferSelect;
