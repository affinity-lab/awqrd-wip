ALTER TABLE `post` RENAME COLUMN `name` TO `title`;--> statement-breakpoint
ALTER TABLE `post` RENAME COLUMN `email` TO `body`;--> statement-breakpoint
ALTER TABLE `post` MODIFY COLUMN `body` text;