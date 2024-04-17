CREATE TABLE `blank` (
	`id` int AUTO_INCREMENT NOT NULL,
	CONSTRAINT `blank_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `_storage` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`itemId` int NOT NULL,
	`data` json DEFAULT ('{}'),
	CONSTRAINT `_storage_id` PRIMARY KEY(`id`),
	CONSTRAINT `_storage_name_itemId_unique` UNIQUE(`name`,`itemId`)
);
