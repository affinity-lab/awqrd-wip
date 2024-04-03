import {drizzle} from "drizzle-orm/mysql2";
import {migrate} from "drizzle-orm/mysql2/migrator";
import {createPool} from "mysql2/promise";
import process from "process";
import * as schema from "../schema/_schema";
import {MaterializeIt} from "../util/materialize-it";

class Factory {
	@MaterializeIt
	get migrator() {
		return async () => migrate(this.connection, {migrationsFolder: process.env["DB_MIGRATIONS"]!});
	}

	@MaterializeIt
	get connection() {
		return drizzle(createPool(process.env["DB_URI"]!), {mode: "default", schema, logger: true});
	}
}

export const factory = new Factory();
