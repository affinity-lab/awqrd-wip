import {int, mysqlTable, text, varchar} from "drizzle-orm/mysql-core";
import {id} from "../storm/helper";

export const post = mysqlTable("post", {
	id: id(),
	title: varchar("title", {length: 255}),
	body: text("body"),
	authorId: int("author_id")
});


