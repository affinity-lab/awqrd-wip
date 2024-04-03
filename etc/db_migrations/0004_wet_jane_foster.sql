ALTER TABLE `user` RENAME COLUMN `modified_at` TO `created_at`;--> statement-breakpoint
ALTER TABLE `user` MODIFY COLUMN `created_at` timestamp DEFAULT (now());--> statement-breakpoint
ALTER TABLE `user` ADD `updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP;