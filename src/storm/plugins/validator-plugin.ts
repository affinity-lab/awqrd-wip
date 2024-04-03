import {z} from "zod";
import {EntityRepository, type State} from "../entity-repository.ts";

export function validatorPlugin(repository: EntityRepository<any, any, any>, upsert: z.ZodObject<any>): void;
export function validatorPlugin(repository: EntityRepository<any, any, any>, insert: z.ZodObject<any>, update?: z.ZodObject<any>): void;
export function validatorPlugin(repository: EntityRepository<any, any, any>, insert: z.ZodObject<any>, update?: z.ZodObject<any>): void {
	repository.insertProcess.pipeline.prepare.append(async (state: State<{ dto: Record<string, any> }>) => {insert.parse(state.dto);})
	repository.updateProcess.pipeline.prepare.append(async (state: State<{ dto: Record<string, any> }>) => {(update ?? insert).parse(state.dto);})
}