import { imgCleanupFactory, Storage} from "@affinity-lab/storm-storage";
import {CacheWithNodeCache, DBG, MaterializeIt, methodCacheFactory, TmpFileFactory} from "@affinity-lab/util";
import {drizzle} from "drizzle-orm/mysql2";
import {migrate} from "drizzle-orm/mysql2/migrator";
import {createPool} from "mysql2/promise";
import NodeCache from "node-cache";
import process from "process";
import * as schema from "../entity/+schema.ts";

class Services {

	@MaterializeIt get dbg() { return new DBG(this.config.debug); }

	@MaterializeIt get config() {
		return {
			db: {
				migrationsFolder: process.env.DB_MIGRATIONS!,
				uri: process.env["DB_URI"]!,
			},
			storage: {
				filePath: process.env.PATH_FILES!,
				imgPath: process.env.PATH_IMG!,
				tmpPath: process.env.PATH_TMP!,
				fileUrlPrefix: process.env.URL_FILES_PREFIX!,
				imgUrlPrefix: process.env.URL_IMAGES_PREFIX!,
			},
			server: {
				port: process.env.port!
			},
			debug: {
				console: {
					dbg: process.env.DEBUG_DBG_CONSOLE === "yes",
					sql: process.env.DEBUG_SQL_CONSOLE === "yes",
					req: process.env.DEBUG_REQ_CONSOLE === "yes",
				},
				file: {
					dbg: process.env.DEBUG_DBG_LOGFILE,
					sql: process.env.DEBUG_SQL_LOGFILE,
					req: process.env.DEBUG_REQ_LOGFILE,
				},
			}
		}
	}

	@MaterializeIt get migrator() {return async () =>{
		dbg.log("Running migrations");
		await migrate(this.connection, {migrationsFolder: this.config.db.migrationsFolder});
	}}

	@MaterializeIt get storage() {
		return new Storage(
			this.config.storage.filePath,
			services.connection,
			schema.storage,
			new CacheWithNodeCache(new NodeCache(), 60),
			imgCleanupFactory(this.config.storage.imgPath)
		)
	}

	@MaterializeIt get connection() { return drizzle(createPool(this.config.db.uri), {mode: "default", schema, logger: this.dbg});}
	@MaterializeIt get tmpFile() {return new TmpFileFactory(this.config.storage.tmpPath)}
	@MaterializeIt get MethodCache(): (ttl: number) => MethodDecorator {return methodCacheFactory(new CacheWithNodeCache(new NodeCache(), 60))}
	@MaterializeIt get responseCache() { return new CacheWithNodeCache(new NodeCache(), 60)}
	@MaterializeIt get entityCache() { return new NodeCache();}
}


export const services = new Services();
export let dbg = services.dbg;
