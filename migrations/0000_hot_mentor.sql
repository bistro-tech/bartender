CREATE TABLE `blame` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`reason` text NOT NULL,
	-- CHECK done manually because drizzle doesn't support CHECK yet: https://github.com/drizzle-team/drizzle-orm/issues/880
	`kind` text NOT NULL CHECK (`kind` IN ('BAN', 'WARN', 'KICK', 'TIMEOUT')),
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	`expires_at` integer,
	`blamee_id` text NOT NULL,
	`blamer_id` text NOT NULL,
	FOREIGN KEY (`blamee_id`) REFERENCES `user`(`id`) ON UPDATE restrict ON DELETE no action,
	FOREIGN KEY (`blamer_id`) REFERENCES `user`(`id`) ON UPDATE restrict ON DELETE no action,
    -- CHECK done manually because drizzle doesn't support CHECK yet: https://github.com/drizzle-team/drizzle-orm/issues/880
    -- Ensure that user_id and blamer_id are not the same
    CHECK (`blamee_id` != `blamer_id`)
);
--> statement-breakpoint
CREATE TABLE `user` (
	`id` text PRIMARY KEY NOT NULL,
	`display_name` text NOT NULL
);
