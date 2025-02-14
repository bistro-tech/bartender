PRAGMA foreign_keys = OFF;

--> statement-breakpoint
CREATE TABLE `__new_blame` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`reason` text NOT NULL,
	`kind` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch ()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch ()) NOT NULL,
	`expires_at` integer,
	`blamee_id` text NOT NULL,
	`blamer_id` text NOT NULL,
	FOREIGN KEY (`blamee_id`) REFERENCES `user` (`id`) ON UPDATE restrict ON DELETE no action,
	FOREIGN KEY (`blamer_id`) REFERENCES `user` (`id`) ON UPDATE restrict ON DELETE no action,
	CONSTRAINT "self_blame_check" CHECK ('blamee_id' != 'blamer_id'),
	CONSTRAINT "blame_kind_check" CHECK ('kind' IN ("BAN", "WARN", "KICK", "TIMEOUT"))
);

--> statement-breakpoint
INSERT INTO
	`__new_blame` (
		"id",
		"reason",
		"kind",
		"created_at",
		"updated_at",
		"expires_at",
		"blamee_id",
		"blamer_id"
	)
SELECT
	"id",
	"reason",
	"kind",
	"created_at",
	"updated_at",
	"expires_at",
	"blamee_id",
	"blamer_id"
FROM
	`blame`;

--> statement-breakpoint
DROP TABLE `blame`;

--> statement-breakpoint
ALTER TABLE `__new_blame`
RENAME TO `blame`;

--> statement-breakpoint
PRAGMA foreign_keys = ON;
