// import {blitzError} from "../errors";
// import {AttachmentRecord, Attachments, TmpFile} from "./types";
import {and, eq, sql} from "drizzle-orm";
import {MySqlTable} from "drizzle-orm/mysql-core";
import type {MySql2Database} from "drizzle-orm/mysql2";
import fs from "fs";
import Path from "path";
import type {Cache} from "../../util/cache/cache.ts";
import {getUniqueFilename} from "../../util/get-unique-filename.ts";
import {MaterializeIt} from "../../util/materialize-it.ts";
import {removeEmptyParentDirectories} from "../../util/remove-empty-parent-directories.ts";
import {sanitizeFilename} from "../../util/sanitize-filename.ts";
import {firstOrUndefined, stmt} from "../tools.ts";
import {storageError} from "./error.ts";
import type {AttachmentRecord, Attachments, TmpFile} from "./types.ts";

export class Storage {
	constructor(
		readonly path: string,
		readonly db: MySql2Database<any>,
		readonly schema: MySqlTable,
		readonly cache?: Cache
	) {

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

	protected key(name: string, id: number): string {return `${name}-${id}`;}


	async get(name: string, id: number, res?: { found?: "db" | "cache" | false }): Promise<Attachments>;
	async get(name: string, id: Array<number>): Promise<Record<number, Attachments>>;
	async get(name: string, id: number | Array<number>): Promise<Attachments | Record<number, Attachments>> ;
	async get(name: string, id: number | Array<number>, res: { found?: "db" | "cache" | false } = {}): Promise<Attachments | Record<number, Attachments>> {
		if (Array.isArray(id)) {
			if (id.length === 0) return [];
			let records: Array<AttachmentRecord>;
			const res: Record<number, Attachments> = {};
			if (this.cache !== undefined) {
				// get available items from cache
				let keys = id.map(id => this.key(name, id));
				records = await this.cache.get(keys);
				for (const i in records) res[records[i].itemId] = JSON.parse(records[i].data);
				// get the rest and set to cache
				const has: Array<number> = records.map(record => record.itemId);
				const need = id.filter(i => !has.includes(i));
				records = await this.stmt_all({name, ids: need});
				for (const i in records) res[records[i].itemId] = JSON.parse(records[i].data);
				const toCache = records.map(record => {return {key: this.key(record.name, record.itemId), value: record};});
				await this.cache.set(toCache);
			} else {
				records = await this.stmt_all({name, ids: id});
				for (const i in records) res[records[i].itemId] = JSON.parse(records[i].data);
			}
			return res;
		} else {
			let record: AttachmentRecord | undefined = await this.cache?.get(this.key(name, id));
			if (record !== undefined) {
				return JSON.parse(record.data);
			}
			record = await this.stmt_get({name, id});
			if (record) {
				this.cache?.set({key: this.key(name, id), value: record});
				return JSON.parse(record.data);
			}
			return [];
		}
	}

	protected async getIndexOfAttachments(name: string, id: number, filename: string, fail: boolean = false) {
		const attachments = await this.get(name, id);
		const idx = attachments.findIndex(a => a.name === filename);
		if (idx === -1 && fail) throw storageError.attachedFileNotFound(name, id, filename);
		return {attachments, index: idx};
	}

	async destroy(name: string, id: number) {
		this.cache?.del(this.key(name, id));
		await this.stmt_del({name, id});
		const path = this.getPath(name, id);
		if (await fs.promises.exists(path)) {
			const files = await fs.promises.readdir(path);
			files.map(async (file) => await fs.promises.unlink(Path.join(path, file)));
			await removeEmptyParentDirectories(path);
		}
	}

	protected async updateRecord(name: string, id: number, attachments: Attachments) {
		this.cache?.del(this.key(name, id));
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
		let res: { found?: "db" | "cache" | false } = {};
		const attachments: Attachments = await this.get(name, id, res);
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
			this.cache?.del(this.key(name, id));
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