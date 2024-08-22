import { relations } from 'drizzle-orm';

import { blame, discord_user } from './schema';

export const blame_relations = relations(blame, ({ one }) => ({
	blamer: one(discord_user, {
		relationName: 'blamer_relation',
		fields: [blame.blamer_id],
		references: [discord_user.id],
	}),
	blamee: one(discord_user, {
		relationName: 'blamee_relation',
		fields: [blame.blamee_id],
		references: [discord_user.id],
	}),
}));

export const discord_user_relations = relations(discord_user, ({ many }) => ({
	blamer: many(blame, { relationName: 'blamer_relation' }),
	blamee: many(blame, { relationName: 'blamee_relation' }),
}));
