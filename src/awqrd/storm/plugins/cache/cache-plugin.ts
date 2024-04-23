import {EntityRepository} from "../../entity-repository.ts";
import type {Cache} from "@affinity-lab/awqrd-util/cache/cache.ts";
import type {State} from "@affinity-lab/awqrd-util/process-pipeline.ts";
import {resultCacheFactory, type ResultCacheFn} from "./result-cache-factory.ts";

export function cachePlugin(repository: EntityRepository<any, any, any>, cache: Cache, resultCache?: ResultCacheFn) {

	if (resultCache === undefined) resultCache = resultCacheFactory(cache);

	repository.pipelines.getOne.blocks
		.prepare.append(async (state: Record<string, any>) => {
			state.dto = await cache.get(state.id);
		})
		.finalize.prepend(async (state: Record<string, any>) => {
			if (state.dto !== undefined){
				await resultCache(state.dto)
				//await cache.set({key: state.id, value: state.dto})
			}
		}
	)

	repository.pipelines.getAll.blocks
		.prepare.append(async (state: State<{ ids: Array<number>, dtos: Array<{ id: number }> }>) => {
			state.dtos = await cache.get(state.ids);
			let dtoIds = state.dtos.map(dto => dto.id);
			state.ids = state.ids.filter(num => !dtoIds.includes(num));
		})
		.finalize.prepend(async (state: State<{ dtos: Array<{ id: number }> }>) => {
			await resultCache(state.dtos);
			// await cache.set(state.dtos.map(dto => {return {key: dto.id, value: dto} }))
		}
	)

	repository.pipelines.update.blocks
		.finalize.append(async (state: State<{ item: { id: number } }>) => { await cache.del(state.item.id)})
	repository.pipelines.delete.blocks
		.finalize.append(async (state: State<{ item: { id: number } }>) => { await cache.del(state.item.id)})
	repository.pipelines.overwrite.blocks
		.finalize.append(async (state: State<{ item: { id: number } }>) => { await cache.del(state.item.id)})

}