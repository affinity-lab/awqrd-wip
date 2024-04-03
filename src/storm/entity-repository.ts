import {sql} from "drizzle-orm";
import {MySqlTable} from "drizzle-orm/mysql-core";
import type {MySql2Database, MySqlRawQueryResult} from "drizzle-orm/mysql2";
import {isSet} from "../util/isset";
import {MaterializeIt} from "../util/materialize-it";
import {ProcessPipeline} from "../util/process-pipeline.ts";
import type {MaybeUndefined, MaybeUnset} from "../util/types";
import {Entity} from "./entity";
import {filterFields, firstOrUndefined, omitFields, stmt} from "./tools";
import type {Dto, Item, WithId, WithIds} from "./types";

export type State<T = {}> = Record<string, any> & T;

/**
 * A generic repository class for handling CRUD operations for storm entities in a MySQL database.
 * @template DB - The type of the database connection.
 * @template SCHEMA - The type of the database schema representing the entity's table.
 * @template ENTITY - The type of the entity class.
 * @template ITEM - The type of the item representing an entity instance.
 * @template DTO - The type of the data transfer object (DTO) representing the entity's schema.
 * @template DTO_I - The type of the DTO used for insert operations.
 * @template DTO_U - The type of the DTO used for update operations.
 */
export class EntityRepository<
	DB extends MySql2Database<any>,
	SCHEMA extends MySqlTable,
	ENTITY extends typeof Entity,
	ITEM extends Item<ENTITY> = Item<ENTITY>,
	DTO extends Dto<SCHEMA> = Dto<SCHEMA>
> {
	readonly fields: string[];

//region Process pipelines

	readonly insertProcess = {
		run: (item: ITEM) => this.insertProcess.pipeline.run({item}).then(res => res.insertId as number),
		pipeline: new ProcessPipeline().ctx(this)
			.prepare.append(async (state: State<{ item: ITEM }>) => {
				state.dto = this.extractItemDTO(state.item)
				await this.transformInsertDTO(state.dto)
			})
			.action.append(async (state: State) => {
				await this.db.insert(this.schema).values(state.dto).execute().then((res: MySqlRawQueryResult) => state.insertId = res[0].insertId)
			})
			.finalize.append(async (state: State) => {
				state.item.id = state.insertId
				await this.reload(state.item)
			})
	}

	readonly updateProcess = {
		run: (item: ITEM) => this.updateProcess.pipeline.run({item}),
		pipeline: new ProcessPipeline().ctx(this)
			.prepare.append(async (state: State) => {
				state.dto = this.extractItemDTO(state.item)
				await this.transformUpdateDTO(state.dto)
			})
			.action.append(async (state: State) => {
				await this.db.update(this.schema).set(state.dto).where(sql`id = ${sql.placeholder("id")}`).execute({id: state.item.id})
			})
			.finalize.append(async (state: State) => {
				await this.reload(state.item)
			})
	}

	readonly deleteProcess = {
		run: (item: ITEM) => this.deleteProcess.pipeline.run({item}),
		pipeline: new ProcessPipeline().ctx(this)
			.action.append(async (state: State) => {
				await this.db.delete(this.schema).where(sql`id = (${sql.placeholder("id")})`).execute({id: state.item.id})
			})
			.finalize.append((state: State) => {
				state.item.id = undefined
			})
	}

	readonly overwriteProcess = {
		run: (item: ITEM, values: Record<string, any>, reload: boolean = true) => this.overwriteProcess.pipeline.run({item, values, reload}),
		pipeline: new ProcessPipeline().ctx(this)
			.action.append(async (state: State) => {
				await this.db.update(this.schema).set(state.values as DTO).where(sql`id = ${sql.placeholder("id")}`).execute({id: state.item.id})
			})
			.finalize.append(async (state: State) => {
				state.reload && await this.reload(state.item)
			})
	}

	readonly getAllProcess = {
		run: (ids: Array<number>) => this.getAllProcess.pipeline.run({ids}).then(state => state.items),
		pipeline: new ProcessPipeline().ctx(this)
			.action.append(async (state: State) => {
				if (state.dtos === undefined) state.dtos = [];
				state.dtos.push(...await this.stmt_all({ids: state.ids}));
			})
			.finalize.append(async (state: State) => {
				state.items = await this.instantiateAll(state.dtos)
			})
	}

	readonly getOneProcess = {
		run: async (id: number) => await this.getOneProcess.pipeline.run({id}).then(state => state.item),
		pipeline: new ProcessPipeline().ctx(this)
			.action.append(async (state: State) => {
				if (state.dto === undefined) {
					state.dto = await this.stmt_get({id: state.id})
				}
			})
			.finalize.append(async (state: State) => {
				if (state.dto !== undefined) state.item = await this.instantiate(state.dto);
			})
	}

//endregion

	/**
	 * Constructs an instance of EntityRepository.
	 * @param db - The database connection.
	 * @param schema - The database schema representing the entity's table.
	 * @param entity - The entity class.
	 */
	constructor(public db: DB, public schema: SCHEMA, public entity: ENTITY) {
		this.fields = Object.keys(schema);
		this.initialize();
	}

	/**
	 * Initializes the object.
	 */
	initialize() {}

//region Instantiate

	/**
	 * Instantiates multiple items from an array of DTOs.
	 * @param dtoSet - An array of DTOs.
	 * @returns An array of instantiated items.
	 */
	async instantiateAll(dtoSet: Array<Record<string, any>>): Promise<Array<ITEM>> {
		const instances = [];
		for (let dto of dtoSet) {
			let instance = await this.instantiate(dto as DTO);
			if (instance !== undefined) instances.push(instance)
		}
		return instances;
	}

	/**
	 * Instantiates the first item from an array of DTOs.
	 * @param dtoSet - An array of DTOs.
	 * @returns The instantiated item, or undefined if the array is blank.
	 */
	async instantiateFirst(dtoSet: Array<Record<string, any>>): Promise<MaybeUndefined<ITEM>> { return this.instantiate(firstOrUndefined(dtoSet));}

	/**
	 * Instantiates an item from a DTO.
	 * @param dto - The DTO.
	 * @returns The instantiated item, or undefined if the DTO is undefined.
	 */
	async instantiate(dto: DTO | undefined): Promise<MaybeUndefined<ITEM>> {
		if (dto === undefined) return undefined;
		let item = await this.create();
		await this.applyItemDTO(item, dto);
		return item;
	}

//endregion

	/**
	 * Applies the data transfer object (DTO) to the item.
	 * @param item The item to apply the DTO to.
	 * @param dto The data transfer object (DTO) containing the data to be applied to the item.
	 */
	protected async applyItemDTO(item: ITEM, dto: DTO) {
		this.transformItemDTO(dto);
		Object.assign(item, dto);
	}

	/**
	 * Retrieves the data transfer object (DTO) from the item.
	 * @param item The item from which to retrieve the DTO.
	 * @returns The DTO representing the item.
	 */
	protected extractItemDTO(item: ITEM): DTO {return Object.assign({}, item) as unknown as DTO;}

//region DTO transform

	/**
	 * Prepares the DTO for saving by filtering and omitting specified fields.
	 * @param dto The DTO to prepare for saving.
	 */
	protected transformSaveDTO(dto: DTO) {
		filterFields(dto, ...this.fields);
		omitFields(dto, "id");
	}

	/**
	 * Prepares the DTO for insertion by filtering and omitting specified fields.
	 * @param dto The DTO to prepare for insertion.
	 */
	protected transformInsertDTO(dto: DTO) {this.transformSaveDTO(dto);}

	/**
	 * Prepares the DTO for updating by filtering and omitting specified fields.
	 * @param dto The DTO to prepare for updating.
	 */
	protected transformUpdateDTO(dto: DTO) {this.transformSaveDTO(dto);}

	/**
	 * Prepares the item DTO. This is a hook method intended for subclass overrides.
	 * @param dto The DTO to prepare.
	 */
	protected transformItemDTO(dto: DTO): void {}

//endregion

//region Statements

	@MaterializeIt
	protected get stmt_all() { return stmt<WithIds, Array<DTO>>(this.db.select().from(this.schema).where(sql`id IN (${sql.placeholder("ids")})`))}
	@MaterializeIt
	protected get stmt_get() { return stmt<WithId, MaybeUndefined<DTO>>(this.db.select().from(this.schema).where(sql`id = ${sql.placeholder("id")}`).limit(1), firstOrUndefined)}

	//endregion

	/**
	 * Retrieves raw data for an entity by its ID.
	 * @param id - The ID of the entity.
	 * @returns A promise resolving to the raw data of the entity, or undefined if not found.
	 */
	async getRaw(id: MaybeUnset<number>): Promise<MaybeUndefined<DTO>> { return isSet(id) ? this.stmt_get({id: id!}) : undefined}

	/**
	 * Retrieves one or multiple items by their IDs.
	 * @param id - The ID or array of IDs of the item(s) to retrieve.
	 * @returns A promise resolving to one or multiple items, or undefined if not found.
	 * @final
	 */
	get(id: Array<number>): Promise<Array<ITEM>>
	get(ids: MaybeUnset<number>): Promise<ITEM | undefined>
	async get(id: Array<number> | number | undefined | null) {
		if (Array.isArray(id)) {
			if (id.length === 0) return [];
			id = [...new Set(id)];
			return this.getAllProcess.run(id)
		} else {
			if (id === undefined || id === null) return undefined;
			return this.getOneProcess.run(id)
		}
	}

	/**
	 * Saves an item by either updating it if it already exists or inserting it if it's new.
	 * @param item - The item to save.
	 * @returns A promise that resolves once the save operation is completed.
	 */
	async save(item: ITEM) {return item.id ? this.updateProcess.run(item) : this.insertProcess.run(item)}

	/**
	 * Updates an existing item.
	 * @param item - The item to update.
	 * @returns A promise that resolves once the update operation is completed.
	 */
	async update(item: ITEM) { return this.updateProcess.run(item) }

	/**
	 * Inserts a new item.
	 * @param item - The item to insert.
	 * @returns A promise that resolves once the insert operation is completed.
	 */
	async insert(item: ITEM) { return this.insertProcess.run(item) }

	/**
	 * Overwrites an item with new values.
	 * @param item - The item to overwrite.
	 * @param values - The new values to overwrite the item with.
	 * @param [reload=true] - Whether to reload the item after overwriting.
	 * @returns A promise that resolves once the overwrite operation is completed.
	 */
	async overwrite(item: ITEM, values: Record<string, any>, reload: boolean = true) { return this.overwriteProcess.run(item, values, reload)}

	/**
	 * Deletes an item.
	 * @param item - The item to delete.
	 * @returns A promise that resolves once the delete operation is completed.
	 */
	async delete(item: ITEM) { return this.deleteProcess.run(item);}

	/**
	 * Creates a blank entity item.
	 * @returns The created item.
	 */
	async create(): Promise<ITEM> {return new this.entity() as unknown as ITEM}

	/**
	 * Reloads the item by fetching the raw data for the item's ID and applying it.
	 * @param item - The item to reload.
	 * @returns A promise that resolves when the item is reloaded.
	 */
	async reload(item: ITEM) { this.getRaw(item.id).then(dto => {isSet(dto) && this.applyItemDTO(item, dto!)})};

}

