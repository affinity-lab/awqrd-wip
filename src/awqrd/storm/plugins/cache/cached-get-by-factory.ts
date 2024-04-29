import type {MySqlColumn} from "drizzle-orm/mysql-core";
import {EntityRepository} from "../../entity-repository.ts";
import {getByFactory} from "../../helper.ts";
import type {WithId} from "../../types.ts";
import type {Cache} from "@affinity-lab/awqrd-util/cache/cache.ts";
import {resultCacheFactory, type ResultCacheFn} from "./result-cache-factory.ts";

export function cachedGetByFactory<T extends string | number, R>(repo: EntityRepository<any, any, any>, fieldName: string, resultCache: ResultCacheFn, mapCache: Cache): (search: T) => Promise<R | undefined> {
	let getBy = getByFactory(repo, fieldName);

	return async (search: T) => {
		let key = `<${fieldName}>:${search}`;
		let id = await mapCache.get(key);
		if (id) {
			let state = await repo.pipelines.getOne.run(repo,{id});
				if(state.dto[fieldName] === search) return state.item;
			await mapCache.del(key);
		}
		let res = await (getBy as unknown as { stmt: any }).stmt.execute({search});
		await resultCache(res)
		let item = await repo.instantiators.first(res) as R;
		if (item) await mapCache.set({key, value: (item as unknown as WithId).id!});
		return item;
	}
}