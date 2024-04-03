CREATE TABLE `post` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255),
	`email` varchar(255),
	`author_id` int,
	CONSTRAINT `post_id` PRIMARY KEY(`id`)
);
