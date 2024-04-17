import type {State} from "../../../util/process-pipeline.ts";
import {EntityRepository} from "../../../storm/entity-repository.ts";
import {Storage} from "../storage.ts";

export function storagePlugin(repository: EntityRepository<any, any, any>, storage: Storage) {
	repository.pipelines.delete.blocks
		.finalize.append(async (state: State<{ item: { id: number } }>) => {
			storage.destroy(repository, state.item.id);
		}
	)
}