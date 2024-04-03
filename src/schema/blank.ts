import {mysqlTable} from "drizzle-orm/mysql-core";
import {id} from "../storm/helper";

export const blank = mysqlTable("blank", {
	id: id(),
});
