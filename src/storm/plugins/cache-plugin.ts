import type {Cache} from "../../util/cache/cache.ts";
import {EntityRepository, type State} from "../entity-repository.ts";

export function cachePlugin(repository: EntityRepository<any, any, any>, cache: Cache) {
	repository.getOneProcess.pipeline
		.prepare.append(async (state: Record<string, any>) => {
			state.dto = await cache.get(state.id);
		})
		.finalize.prepend(async (state: Record<string, any>) => {
			if (state.dto !== undefined){
				await cache.set({key: state.id, value: state.dto})
			}
		}
	)

	repository.getAllProcess.pipeline
		.prepare.append(async (state: State<{ ids: Array<number>, dtos:Array<{id:number}> }>) => {
			state.dtos = await cache.get(state.ids);
			let dtoIds = state.dtos.map(dto=>dto.id);
			state.ids = state.ids.filter(num => !dtoIds.includes(num));
		})
		.finalize.prepend(async (state: State<{ dtos: Array<{ id: number }> }>) => {
			await cache.set(state.dtos.map(dto => {return {key: dto.id, value: dto} }))
		}
	)

	repository.updateProcess.pipeline
		.finalize.append(async (state: State<{ item: { id: number } }>) => { await cache.del(state.item.id)})
	repository.deleteProcess.pipeline
		.finalize.append(async (state: State<{ item: { id: number } }>) => { await cache.del(state.item.id)})
	repository.overwriteProcess.pipeline
		.finalize.append(async (state: State<{ item: { id: number } }>) => { await cache.del(state.item.id)})

}