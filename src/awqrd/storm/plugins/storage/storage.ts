import {and, eq, sql} from "drizzle-orm";
import {MySqlTable} from "drizzle-orm/mysql-core";
import type {MySql2Database} from "drizzle-orm/mysql2";
import fs from "fs";
import Path from "path";
import {stmt} from "../../helper.ts";
import type {Cache} from "@affinity-lab/awqrd-util/cache/cache.ts";
import {getUniqueFilename} from "@affinity-lab/awqrd-util/fs/get-unique-filename.ts";
import {MaterializeIt} from "@affinity-lab/awqrd-util/materialize-it.ts";
import {removeEmptyParentDirectories} from "@affinity-lab/awqrd-util/fs/remove-empty-parent-directories.ts";
import {sanitizeFilename} from "@affinity-lab/awqrd-util/fs/sanitize-filename.ts";
import type {IEntityRepository} from "../../entity-repository-interface.ts";
import {firstOrUndefined} from "@affinity-lab/awqrd-util/object.ts";
import {Collection} from "./collection.ts";
import {storageError} from "./helper/error.ts";
import type {AttachmentObjects, AttachmentRecord, TmpFile} from "./helper/types.ts";

export class Storage {
	constructor(
		readonly path: string,
		readonly db: MySql2Database<any>,
		readonly schema: MySqlTable,
		readonly cache?: Cache,
		readonly cleanup?: (name: string, id: number, file: string) => Promise<void>
	) {

	}

	collections: Record<string, Collection<any>> = {}

	addCollection(collection: any) {
		if (this.collections[collection.name] !== undefined) throw new Error(`collection name must be unique! ${collection.name}`);
		this.collections[collection.name] = collection;
	}

	getGroupDefinition(name: string, entityRepository: IEntityRepository) {
		return {
			storage: this,
			group: name,
			entityRepository
		}
	}

	@MaterializeIt
	private get stmt_get() {
		return stmt<{ name: string, id: number }, AttachmentRecord | undefined>(
			this.db.select().from(this.schema).where(and(
				sql`name = ${sql.placeholder("name")}`,
				sql`itemId = ${sql.placeholder("id")}`
			)).limit(1),
			firstOrUndefined
		)
	}

	@MaterializeIt
	private get stmt_all() {
		return stmt<{ name: string, ids: Array<number> }, Array<AttachmentRecord>>(
			this.db.select().from(this.schema).where(and(
				sql`itemId IN (${sql.placeholder("ids")})`,
				sql`name = ${sql.placeholder("name")}`
			))
		)
	}

	@MaterializeIt
	private get stmt_del() {
		return stmt<{ name: string, id: number }, AttachmentRecord>(
			this.db.delete(this.schema).where(and(
				sql`itemId = (${sql.placeholder("id")})`,
				sql`name = ${sql.placeholder("name")}`
			))
		)
	}

	protected getPath(name: string, id: number) { return Path.resolve(this.path, name, id.toString(36).padStart(6, "0").match(/.{1,2}/g)!.join("/"));}

	protected getCacheKey(name: string, id: number): string {return `${name}-${id}`;}

	async get(name: string, id: number, res: { found?: "db" | "cache" | false } = {}): Promise<AttachmentObjects> {
		let record: AttachmentRecord | undefined = await this.cache?.get(this.getCacheKey(name, id));
		if (record) {
			res.found = "cache"
			return JSON.parse(record.data);
		}
		record = await this.stmt_get({name, id});
		if (record) {
			res.found = "db"
			this.cache?.set({key: this.getCacheKey(name, id), value: record});
			return JSON.parse(record.data);
		}
		return []
	}

	protected async getIndexOfAttachments(name: string, id: number, filename: string, fail: boolean = false) {
		const attachments = await this.get(name, id);
		const idx = attachments.findIndex(a => a.name === filename);
		if (idx === -1 && fail) throw storageError.attachedFileNotFound(name, id, filename);
		return {attachments, index: idx};
	}

	async destroy(repository: IEntityRepository, id:number){
		for (const collectionsKey in this.collections) {
			await this.destroyFiles(collectionsKey, id);
		}
	}

	protected async destroyFiles(name: string, id: number) {
		this.cache?.del(this.getCacheKey(name, id));
		await this.stmt_del({name, id});
		const path = this.getPath(name, id);
		if (await fs.promises.exists(path)) {
			const files = await fs.promises.readdir(path);
			files.map(async (file) => {
				await fs.promises.unlink(Path.join(path, file))
				if (this.cleanup !== undefined) await this.cleanup(name, id, file);
			});
			await removeEmptyParentDirectories(path);
		}
	}

	protected async updateRecord(name: string, id: number, attachments: AttachmentObjects) {
		this.cache?.del(this.getCacheKey(name, id));
		await this.db.update(this.schema)
			.set({data: JSON.stringify(attachments)})
			.where(
				and(
					eq(sql`itemId`, sql.placeholder("id")),
					eq(sql`name`, sql.placeholder("name"))
				)
			)
			.execute({name, id});
	}

	async add(name: string, id: number, file: TmpFile, metadata: Record<string, any>) {
		let path = this.getPath(name, id);
		let filename = Path.basename(file.filename);
		filename = sanitizeFilename(filename);
		filename = await getUniqueFilename(path, filename);
		await fs.promises.mkdir(path, {recursive: true});
		await fs.promises.copyFile(file.file, Path.join(path, filename));
		let res: { found?: "db" | "cache" | false } = {found: false};
		const attachments: AttachmentObjects = await this.get(name, id, res);
		attachments.push({
			name: filename,
			size: (await fs.promises.stat(file.file)).size,
			id: crypto.randomUUID(),
			metadata
		});
		if (res.found === false) {
			await this.db.insert(this.schema).values({name, itemId: id, data: JSON.stringify(attachments)}).execute();
		} else {
			await this.db.update(this.schema).set({data: JSON.stringify(attachments)}).where(and(
				sql`name = ${sql.placeholder("name")}`,
				sql`itemId = ${sql.placeholder("id")}`
			)).execute({name, id});
			this.cache?.del(this.getCacheKey(name, id));
		}
		file.release();
	}

	async delete(name: string, id: number, filename: string) {
		let {attachments, index} = await this.getIndexOfAttachments(name, id, filename, true);
		attachments.splice(index, 1);
		await this.updateRecord(name, id, attachments);
		const path = this.getPath(name, id);
		await fs.promises.unlink(Path.resolve(path, filename));
		await removeEmptyParentDirectories(path);
	}

	async setPosition(name: string, id: number, filename: string, position: number) {
		const attachments = await this.get(name, id);
		const idx = attachments.findIndex(a => a.name === filename);
		if (idx === -1) throw storageError.attachedFileNotFound(name, id, filename);
		if (idx === position) return;
		attachments.splice(position, 0, ...attachments.splice(idx, 1));
		await this.updateRecord(name, id, attachments);
	}

	async updateMetadata(name: string, id: number, filename: string, metadata: Record<string, any>) {
		const attachments = await this.get(name, id);
		const idx = attachments.findIndex(a => a.name === filename);
		if (idx === -1) throw storageError.attachedFileNotFound(name, id, filename);
		attachments[idx].metadata = {...attachments[idx].metadata, ...metadata};
		await this.updateRecord(name, id, attachments);
	}

	async rename(name: string, id: number, filename: string, newName: string) {
		const attachments = await this.get(name, id);
		const idx = attachments.findIndex(a => a.name === filename);
		if (idx === -1) throw storageError.attachedFileNotFound(name, id, filename);
		let path = this.getPath(name, id);
		newName = sanitizeFilename(newName);
		newName = await getUniqueFilename(path, newName);
		attachments[idx].name = newName;
		await fs.promises.rename(Path.join(path, filename), Path.join(path, newName));
		await this.updateRecord(name, id, attachments);
	}
}