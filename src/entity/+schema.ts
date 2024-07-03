import {stormSchemaHelpers} from "@affinity-lab/storm";
import {stormStorageSchemaHelpers} from "@affinity-lab/storm-storage";
import {char, int, mysqlTable, text, timestamp, varchar} from "drizzle-orm/mysql-core";

export const user = mysqlTable("user", {
	id: stormSchemaHelpers.id(),
	name: varchar("name", {length: 255}),
	email: varchar("email", {length: 255}),
	sex: varchar("sex", {length: 255}),
	password: char("password", {length: 255}),
	createdAt: timestamp('created_at').defaultNow(),
	updatedAt: timestamp('updated_at').onUpdateNow(),
	role: varchar("role", {length: 255})
});

export const blank = mysqlTable("blank", {
	id: stormSchemaHelpers.id(),
});

export const post = mysqlTable("post", {
	id: stormSchemaHelpers.id(),
	title: varchar("title", {length: 255}),
	body: text("body"),
	authorId: int("author_id")
});

// NOTE: for references you can use stormSchemaHelpers.reference
// EXAMPLE: userId = stormSchemaHelpers.reference("user_id", () => user.id)


export let storage = stormStorageSchemaHelpers.storageSchemaFactory();