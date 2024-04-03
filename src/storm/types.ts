import type {InferSelectModel} from "drizzle-orm";
import type {MySqlTable} from "drizzle-orm/mysql-core";
import type {MaybeUnset} from "../util/types";

export type WithIdOptional<TYPE = {}> = Omit<TYPE, "id"> & { id: MaybeUnset<number> }
export type WithId<TYPE = {}> = { id: number } & TYPE
export type WithIds<TYPE = {}> = { ids: Array<number> } & TYPE

export type Dto<SCHEMA extends MySqlTable> = WithIdOptional<InferSelectModel<SCHEMA>>
export type Item<ENTITY extends new (...args: any) => any> = WithIdOptional<InstanceType<ENTITY>>

