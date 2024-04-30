import {char, int, json, mysqlTable, serial, text, timestamp, unique, varchar} from "drizzle-orm/mysql-core";

function id() { return int("id").autoincrement().primaryKey(); }

function stormStorageSchemaFactory(name: string = "_storage") {
	return mysqlTable(name, {
			id: serial("id").primaryKey(),
			name: varchar("name", {length: 255}).notNull(),
			itemId: int("itemId").notNull(),
			data: json("data").default("{}")
		},
		(t: any) => ({
			unq: unique().on(t.name, t.itemId)
		})
	);
}
export const user = mysqlTable("user", {
	id: id(),
	name: varchar("name", {length: 255}),
	email: varchar("email", {length: 255}),
	sex: varchar("sex", {length: 255}),
	password: char("password", {length: 255}),
	createdAt: timestamp('created_at').defaultNow(),
	updatedAt: timestamp('updated_at').onUpdateNow(),
	role: varchar("role", {length: 255})
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

export const tag = mysqlTable("tag", {
	id: id(),
	name: varchar("name", {length: 2048})
})


export let storage = stormStorageSchemaFactory()