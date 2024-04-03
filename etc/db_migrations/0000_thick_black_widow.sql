CREATE TABLE `user` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255),
	`email` varchar(255),
	`password` char(255),
	`roleLevel` int DEFAULT 0,
	CONSTRAINT `user_id` PRIMARY KEY(`id`)
);
