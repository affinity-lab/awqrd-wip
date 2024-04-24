import {MySqlTable} from "drizzle-orm/mysql-core";
import type {MySql2Database} from "drizzle-orm/mysql2";
import type {MaybeUndefined, MaybeUnset} from "@affinity-lab/awqrd-util/types.ts";
import {Entity} from "./entity.ts";
import type {WithId} from "./types.ts";

export interface IEntityRepository {
	fields: string[];

	readonly db: MySql2Database<any>;
	readonly schema: MySqlTable<any>;
	readonly entity: typeof Entity;
	/**
	 * Retrieves raw data for an entity by its ID.
	 * @param id - The ID of the entity.
	 * @returns A promise resolving to the raw data of the entity, or undefined if not found.
	 */
	getRaw(id: MaybeUnset<number>): Promise<MaybeUndefined<Record<string, any>>>;
	/**
	 * Retrieves one or multiple items by their IDs.
	 * @param id - The ID or array of IDs of the item(s) to retrieve.
	 * @returns A promise resolving to one or multiple items, or undefined if not found.
	 * @final
	 */
	get(id: Array<number>): Promise<Array<WithId>>;
	get(ids: MaybeUnset<number>): Promise<WithId | undefined>;
	get(id: Array<number> | number | undefined | null): Promise<any>;
	/**
	 * Saves an item by either updating it if it already exists or inserting it if it's new.
	 * @param item - The item to save.
	 * @returns A promise that resolves once the save operation is completed.
	 */
	save(item: Record<string, any>): Promise<any>;
	/**
	 * Updates an existing item.
	 * @param item - The item to update.
	 * @returns A promise that resolves once the update operation is completed.
	 */
	update(item: Record<string, any>): Promise<any>;
	/**
	 * Inserts a new item.
	 * @param item - The item to insert.
	 * @returns A promise that resolves once the insert operation is completed.
	 */
	insert(item: Record<string, any>): Promise<any>;
	/**
	 * Overwrites an item with new values.
	 * @param item - The item to overwrite.
	 * @param values - The new values to overwrite the item with.
	 * @param [reload=true] - Whether to reload the item after overwriting.
	 * @returns A promise that resolves once the overwrite operation is completed.
	 */
	overwrite(item: Record<string, any>, values: Record<string, any>, reload: boolean): Promise<any>;
	/**
	 * Deletes an item.
	 * @param item - The item to delete.
	 * @returns A promise that resolves once the delete operation is completed.
	 */
	delete(item: Record<string, any>): Promise<any>;
	/**
	 * Creates a blank entity item.
	 * @returns The created item.
	 */
	create(): Promise<Record<string, any>>;
	/**
	 * Reloads the item by fetching the raw data for the item's ID and applying it.
	 * @param item - The item to reload.
	 * @returns A promise that resolves when the item is reloaded.
	 */
	reload(item: Record<string, any>): Promise<void>;
}