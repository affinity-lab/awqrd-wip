import {sql} from "drizzle-orm";
import {MySqlTable} from "drizzle-orm/mysql-core";
import type {MySql2Database, MySqlRawQueryResult} from "drizzle-orm/mysql2";
import {MaterializeIt} from "@affinity-lab/awqrd-util/materialize-it.ts";
import {firstOrUndefined, omitFieldsIP, pickFieldsIP} from "@affinity-lab/awqrd-util/object.ts";
import {ProcessPipeline, type State} from "@affinity-lab/awqrd-util/process-pipeline.ts";
import type {MaybePromise, MaybeUndefined, MaybeUnset} from "@affinity-lab/awqrd-util/types.ts";
import type {IEntityRepository} from "./entity-repository-interface.ts";
import {Entity} from "./entity.ts";
import {stmt} from "./helper.ts";
import type {Dto, Item, WithId, WithIds} from "./types.ts";


/**
 * A generic repository class for handling CRUD operations for storm entity in a MySQL database.
 * @template DB - The type of the database connection.
 * @template SCHEMA - The type of the database schema representing the entity's table.
 * @template ENTITY - The type of the entity class.
 */
export class EntityRepository<
	DB extends MySql2Database<any>,
	SCHEMA extends MySqlTable,
	ENTITY extends typeof Entity
> implements IEntityRepository {
	readonly fields: string[];

//region Process pipelines

	public readonly pipelines = {
		insert: new ProcessPipeline("prepare", "action", "finalize").setup({
			prepare: (async (state: State<{ item: Item<ENTITY> }>) => {
				state.dto = this.extractItemDTO(state.item)
				await this.transformInsertDTO(state.dto)
			}),
			action: (async (state: State) => {
				await this.db.insert(this.schema).values(state.dto).execute().then((res: MySqlRawQueryResult) => state.insertId = res[0].insertId)
			}),
			finalize: (async (state: State) => {
				state.item.id = state.insertId
				await this.reload(state.item)
			})
		}),
		update: new ProcessPipeline("prepare", "action", "finalize").setup({
			prepare: (async (state: State) => {
				state.dto = this.extractItemDTO(state.item)
				await this.transformUpdateDTO(state.dto)
			}),
			action: (async (state: State) => {
				await this.db.update(this.schema).set(state.dto).where(sql`id = ${sql.placeholder("id")}`).execute({id: state.item.id})
			}),
			finalize: (async (state: State) => {
				await this.reload(state.item)
			})
		}),
		getOne: new ProcessPipeline("prepare", "action", "finalize").setup({
			action: (async (state: State) => {
				if (state.dto === undefined) state.dto = await this.stmt_get({id: state.id})
			}),
			finalize: (async (state: State) => {
				if (state.dto !== undefined) state.item = await this.instantiate(state.dto)
			})
		}),
		getAll: new ProcessPipeline("prepare", "action", "finalize").setup({
			action: (async (state: State) => {
				if (state.dtos === undefined) state.dtos = [];
				state.dtos.push(...await this.stmt_all({ids: state.ids}));
			}),
			finalize: (async (state: State) => {
				state.items = await this.instantiateAll(state.dtos)
			})
		}),
		delete: new ProcessPipeline("prepare", "action", "finalize").setup({
			action: (async (state: State) => {
				await this.db.delete(this.schema).where(sql`id = (${sql.placeholder("id")})`).execute({id: state.item.id})
			}),
			finalize: ((state: State) => {
				state.item.id = undefined
			})
		}),
		overwrite: new ProcessPipeline("prepare", "action", "finalize").setup({
			action: async (state: State) => {
				await this.db.update(this.schema).set(state.values as Dto<SCHEMA>).where(sql`id = ${sql.placeholder("id")}`).execute({id: state.item.id})
			},
			finalize: async (state: State) => {
				state.reload && await this.reload(state.item)
			}
		})
	}

	protected exec = {
		delete: async (item: Item<ENTITY>) => {return await this.pipelines.delete.run(this, {item})},
		insert: async (item: Item<ENTITY>) => {return await this.pipelines.insert.run(this, {item}).then(res => res.insertId as number)},
		update: async (item: Item<ENTITY>) => {return await this.pipelines.update.run(this, {item})},
		getOne: async (id: number) => {return await this.pipelines.getOne.run(this, {id}).then(state => state.item)},
		getAll: async (ids: Array<number>) => { return this.pipelines.getAll.run(this, {ids}).then(state => state.items)},
		overwrite: async (item: Item<ENTITY>, values: Record<string, any>, reload: boolean = true) => { return await this.pipelines.overwrite.run(this, {item, values, reload})}
	}


//endregion

	/**
	 * Constructs an instance of EntityRepository.
	 * @param db - The database connection.
	 * @param schema - The database schema representing the entity's table.
	 * @param entity - The entity class.
	 */
	constructor(readonly db: DB, readonly schema: SCHEMA, readonly entity: ENTITY) {
		this.fields = Object.keys(schema);
		this.initialize();
	}


	/**
	 * Initializes the object.
	 */
	protected initialize() {}


//region Instantiate

	/**
	 * Instantiates multiple items from an array of DTOs.
	 * @param dtoSet - An array of DTOs.
	 * @returns An array of instantiated items.
	 */
	public async instantiateAll(dtoSet: Array<Record<string, any>>): Promise<Array<Item<ENTITY>>> {
		const instances = [];
		for (let dto of dtoSet) {
			let instance = await this.instantiate(dto as Dto<SCHEMA>);
			if (instance !== undefined) instances.push(instance)
		}
		return instances;
	}

	/**
	 * Instantiates the first item from an array of DTOs.
	 * @param dtoSet - An array of DTOs.
	 * @returns The instantiated item, or undefined if the array is blank.
	 */
	public async instantiateFirst(dtoSet: Array<Record<string, any>>): Promise<MaybeUndefined<Item<ENTITY>>> { return this.instantiate(firstOrUndefined(dtoSet));}

	/**
	 * Instantiates an item from a DTO.
	 * @param dto - The DTO.
	 * @returns The instantiated item, or undefined if the DTO is undefined.
	 */
	public async instantiate(dto: Dto<SCHEMA> | undefined): Promise<MaybeUndefined<Item<ENTITY>>> {
		if (dto === undefined) return undefined;
		let item = await this.create();
		await this.applyItemDTO(item, dto);
		return item;
	}

	public instantiators = {
		all: (res: any) => this.instantiateAll(res),
		first: (res: any) => this.instantiateFirst(res),
	}


//endregion

	/**
	 * Applies the data transfer object (DTO) to the item.
	 * @param item The item to apply the DTO to.
	 * @param dto The data transfer object (DTO) containing the data to be applied to the item.
	 */
	protected async applyItemDTO(item: Item<ENTITY>, dto: Dto<SCHEMA>) {
		this.transformItemDTO(dto);
		Object.assign(item, dto);
	}

	/**
	 * Retrieves the data transfer object (DTO) from the item.
	 * @param item The item from which to retrieve the DTO.
	 * @returns The DTO representing the item.
	 */
	protected extractItemDTO(item: Item<ENTITY>): Dto<SCHEMA> {return Object.assign({}, item) as unknown as Dto<SCHEMA>;}

//region DTO transform

	/**
	 * Prepares the DTO for saving by filtering and omitting specified fields.
	 * @param dto The DTO to prepare for saving.
	 */
	protected transformSaveDTO(dto: Dto<SCHEMA>) {
		pickFieldsIP(dto, ...this.fields);
		omitFieldsIP(dto, "id");
	}

	/**
	 * Prepares the DTO for insertion by filtering and omitting specified fields.
	 * @param dto The DTO to prepare for insertion.
	 */
	protected transformInsertDTO(dto: Dto<SCHEMA>): MaybePromise<void> {this.transformSaveDTO(dto);}

	/**
	 * Prepares the DTO for updating by filtering and omitting specified fields.
	 * @param dto The DTO to prepare for updating.
	 */
	protected transformUpdateDTO(dto: Dto<SCHEMA>): MaybePromise<void> {this.transformSaveDTO(dto);}

	/**
	 * Prepares the item DTO. This is a hook method intended for subclass overrides.
	 * @param dto The DTO to prepare.
	 */
	protected transformItemDTO(dto: Dto<SCHEMA>): MaybePromise<void> {}

//endregion

//region Statements

	@MaterializeIt
	protected get stmt_all() { return stmt<WithIds, Array<Dto<SCHEMA>>>(this.db.select().from(this.schema).where(sql`id IN (${sql.placeholder("ids")})`))}
	@MaterializeIt
	protected get stmt_get() { return stmt<WithId, MaybeUndefined<Dto<SCHEMA>>>(this.db.select().from(this.schema).where(sql`id = ${sql.placeholder("id")}`).limit(1), firstOrUndefined)}

	//endregion

	/**
	 * Retrieves raw data for an entity by its ID.
	 * @param id - The ID of the entity.
	 * @returns A promise resolving to the raw data of the entity, or undefined if not found.
	 */
	async getRaw(id: MaybeUnset<number>): Promise<MaybeUndefined<Dto<SCHEMA>>> { return id ? this.stmt_get({id: id!}) : undefined}

	/**
	 * Retrieves one or multiple items by their IDs.
	 * @param id - The ID or array of IDs of the item(s) to retrieve.
	 * @returns A promise resolving to one or multiple items, or undefined if not found.
	 * @final
	 */
	get(id: Array<number>): Promise<Array<WithId<Item<ENTITY>>>>
	get(ids: MaybeUnset<number>): Promise<WithId<Item<ENTITY>> | undefined>
	async get(id: Array<number> | number | undefined | null) {
		if (Array.isArray(id)) {
			if (id.length === 0) return [];
			id = [...new Set(id)];
			return this.exec.getAll(id)
		} else {
			if (id === undefined || id === null) return undefined;
			return this.exec.getOne(id)
		}
	}

	/**
	 * Saves an item by either updating it if it already exists or inserting it if it's new.
	 * @param item - The item to save.
	 * @returns A promise that resolves once the save operation is completed.
	 */
	async save(item: Item<ENTITY>) {return item.id ? this.update(item) : this.insert(item)}

	/**
	 * Updates an existing item.
	 * @param item - The item to update.
	 * @returns A promise that resolves once the update operation is completed.
	 */
	async update(item: Item<ENTITY>) { return this.exec.update(item) }

	/**
	 * Inserts a new item.
	 * @param item - The item to insert.
	 * @returns A promise that resolves once the insert operation is completed.
	 */
	async insert(item: Item<ENTITY>) { return this.exec.insert(item) }

	/**
	 * Overwrites an item with new values.
	 * @param item - The item to overwrite.
	 * @param values - The new values to overwrite the item with.
	 * @param [reload=true] - Whether to reload the item after overwriting.
	 * @returns A promise that resolves once the overwrite operation is completed.
	 */
	async overwrite(item: Item<ENTITY>, values: Record<string, any>, reload: boolean = true) { return this.exec.overwrite(item, values, reload)}

	/**
	 * Deletes an item.
	 * @param item - The item to delete.
	 * @returns A promise that resolves once the delete operation is completed.
	 */
	async delete(item: Item<ENTITY>) { return this.exec.delete(item);}

	/**
	 * Creates a blank entity item.
	 * @returns The created item.
	 */
	async create(): Promise<Item<ENTITY>> {return new this.entity() as unknown as Item<ENTITY>}

	/**
	 * Reloads the item by fetching the raw data for the item's ID and applying it.
	 * @param item - The item to reload.
	 * @returns A promise that resolves when the item is reloaded.
	 */
	async reload(item: Item<ENTITY>) { this.getRaw(item.id).then(dto => { dto && this.applyItemDTO(item, dto!)})};

}

