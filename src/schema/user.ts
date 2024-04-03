import {char, mysqlTable, timestamp, varchar} from "drizzle-orm/mysql-core";
import {id} from "../storm/helper";

export const user = mysqlTable("user", {
	id: id(),
	name: varchar("name", {length: 255}),
	email: varchar("email", {length: 255}),
	sex: varchar("sex", {length: 255}),
	password: char("password", {length: 255}),
	createdAt: timestamp('created_at').defaultNow(),
	updatedAt: timestamp('updated_at').onUpdateNow()
});
