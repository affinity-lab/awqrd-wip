import {z} from "zod";
import type {State} from "@affinity-lab/awqrd-util/process-pipeline.ts";
import {EntityRepository} from "../../entity-repository.ts";

/**
 * A description of the entire function.
 *
 * @param {EntityRepository<any, any, any>} repository - description of parameter
 * @param {z.ZodObject<any>} upsert - description of parameter
 * @return {void} description of return value
 */
export function validatorPlugin(repository: EntityRepository<any, any, any>, upsert: z.ZodObject<any>): void;
/**
 * A description of the entire function.
 *
 * @param {EntityRepository<any, any, any>} repository - description of parameter
 * @param {z.ZodObject<any>} insert - description of parameter
 * @param {z.ZodObject<any>} [update] - description of parameter
 * @return {void} description of return value
 */
export function validatorPlugin(repository: EntityRepository<any, any, any>, insert: z.ZodObject<any>, update?: z.ZodObject<any>): void;
export function validatorPlugin(repository: EntityRepository<any, any, any>, insert: z.ZodObject<any>, update?: z.ZodObject<any>): void {
	repository.pipelines.insert.blocks.prepare.append(async (state: State<{ dto: Record<string, any> }>) => {insert.parse(state.dto);})
	repository.pipelines.update.blocks.prepare.append(async (state: State<{ dto: Record<string, any> }>) => {(update ?? insert).parse(state.dto);})
}