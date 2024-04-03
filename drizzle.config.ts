import type {Config} from "drizzle-kit";
import * as process from "process";

export default {
	verbose: true,
	schema: process.env["DB_SCHEMA"]!,
	out: process.env["DB_MIGRATIONS"],
	driver: "mysql2",
	dbCredentials: {
		uri: process.env["DB_URI"]!
	}
} satisfies Config;

