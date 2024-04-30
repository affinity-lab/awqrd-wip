import type {State} from "@affinity-lab/awqrd-util/process-pipeline.ts";
import {EntityRepository} from "../../entity-repository.ts";
import {TagRepository} from "./tag-repository";

export function tagPlugin(repository: EntityRepository<any, any, any>, tagRepository: TagRepository<any, any, any>, field: string) {
	console.log("********* TAG PLUGIN START *********")
	tagRepository.addUsage({repo: repository, field});

	repository.pipelines.update.blocks
		.prepare.append(async (state: State) => {
			state.prevDto = await repository.getRaw(state.item.id);
			tagRepository.prepare(repository, state);
	} )
		.finalize.append(async (state: State) => {
			await tagRepository.selfRename(state);
			await tagRepository.updateTag(repository, state);
	})

	repository.pipelines.delete.blocks
		.finalize.append(async (state: State) => {
			await tagRepository.updateTag(repository, state);
			await tagRepository.deleteInUsages(state.dto.name);
	})

	repository.pipelines.insert.blocks
		.prepare.append(async (state: State) => {
			state.prevDto = await repository.getRaw(state.item.id);
			tagRepository.prepare(repository, state);
	} )

	repository.pipelines.overwrite.blocks
		.finalize.append(async (state: State) => {
		await tagRepository.selfRename(state);
		await tagRepository.updateTag(repository, state);
	})
	console.log("********* TAG PLUGIN END *********")
}