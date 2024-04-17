import {char, int, mysqlTable, text, timestamp, varchar} from "drizzle-orm/mysql-core";
import {stormStorageSchemaFactory} from "../awqrd/storm-plugins/storage/helper/storm-storage-schema-factory.ts";
import {id} from "../awqrd/storm/helper.ts";

export const user = mysqlTable("user", {
	id: id(),
	name: varchar("name", {length: 255}),
	email: varchar("email", {length: 255}),
	sex: varchar("sex", {length: 255}),
	password: char("password", {length: 255}),
	createdAt: timestamp('created_at').defaultNow(),
	updatedAt: timestamp('updated_at').onUpdateNow()
});

export const blank = mysqlTable("blank", {
	id: id(),
});

export const post = mysqlTable("post", {
	id: id(),
	title: varchar("title", {length: 255}),
	body: text("body"),
	authorId: int("author_id")
});


export let storage = stormStorageSchemaFactory()