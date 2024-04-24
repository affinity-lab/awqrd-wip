import {minimatch} from "minimatch";
import type {IEntity} from "../../types.ts";
import type {Attachment} from "./attachment.ts";
import {Collection} from "./collection.ts";
import type {TmpFile} from "./helper/types.ts";
import type {Storage} from "./storage.ts";

export class CollectionHandler<METADATA extends Record<string, any>> extends Array<Attachment<METADATA>> {
	readonly #collection: Collection<METADATA>
	readonly #entity: IEntity

	protected loaded = false;

	get entity() {return this.#entity}
	get id(): number {return this.#entity.id!}
	get collection(): Collection<METADATA> {return this.#collection}
	get storage(): Storage {return this.#collection.storage}

	constructor(collection: Collection<METADATA>, entity: IEntity) {
		super();
		this.#collection = collection;
		this.#entity = entity;
	}

	push(...args: any[]): never { throw Error(`can not push into collection handler ${this.collection.name}`);}
	unshift(...args: any[]): never { throw Error(`can not unshift collection handler ${this.collection.name}`);}
	pop(): never { throw Error(`can not pop from collection handler ${this.collection.name}`);}
	shift(): never { throw Error(`can not shift from collection handler ${this.collection.name}`);}

	public async load(): Promise<this> {
		// todo: make proper update instead of this
		this.loaded = true;
		this.length = 0;
		super.push(...(await this.collection.get(this.entity.id!)));
		return this;
	}

	async add(file: TmpFile) {
		await this.load();
		const prepared = await this.collection.prepare(this, file);
		await this.collection.storage.add(
			this.collection.name,
			this.entity.id!,
			prepared.file,
			prepared.metadata
		);
		prepared.file.release();
		await this.load();
	}

	toJSON() {
		return {
			collection: this.collection.name,
			id: this.id,
			files: this.loaded ? [...this] : null
		}
	}

	first(): Attachment<METADATA> | undefined {return this.at(0);}
	last(): Attachment<METADATA> | undefined {return this.at(-1)}
	findFile(filename: string): Attachment<METADATA> | undefined { return this.find(obj => filename === obj.name)}
	findFiles(glob: string): Array<Attachment<METADATA>> { return this.filter(obj => minimatch(obj.name, glob))}
}