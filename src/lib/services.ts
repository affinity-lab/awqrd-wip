import {CacheWithNodeCache, imgCleanupFactory, MaterializeIt, methodCacheFactory, Storage, TmpFileFactory} from "@affinity-lab/awqrd";
import {drizzle} from "drizzle-orm/mysql2";
import {migrate} from "drizzle-orm/mysql2/migrator";
import {createPool} from "mysql2/promise";
import NodeCache from "node-cache";
import process from "process";
import * as schema from "../entity/+schema.ts";
import {storage} from "../entity/+schema.ts";

class Services {
	@MaterializeIt get migrator() {
		return async () => migrate(this.connection, {migrationsFolder: process.env["DB_MIGRATIONS"]!});
	}

	@MaterializeIt get connection() {
		return drizzle(createPool(process.env["DB_URI"]!), {mode: "default", schema, logger: true});
	}

	@MaterializeIt get tmpFile() {
		return new TmpFileFactory(process.env["PATH_TMP"]!)
	}

	@MaterializeIt get storage() {
		return new Storage(
			process.env["PATH_FILES"]!,
			services.connection,
			storage,
			new CacheWithNodeCache(new NodeCache(), 60),
			imgCleanupFactory(process.env["PATH_IMG"]!)
		)
	}

	@MaterializeIt get MethodCache(): (ttl: number) => MethodDecorator {
		return methodCacheFactory(new CacheWithNodeCache(new NodeCache(), 60))
	}

	@MaterializeIt get responseCache() {
		return new CacheWithNodeCache(new NodeCache(), 60)
	}

	@MaterializeIt get entityCache() {
		return new NodeCache();
	}


}

export const services = new Services();
