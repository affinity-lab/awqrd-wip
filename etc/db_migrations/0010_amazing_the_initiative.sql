CREATE TABLE `tag` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(2048),
	CONSTRAINT `tag_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `user` ADD `role` varchar(255);