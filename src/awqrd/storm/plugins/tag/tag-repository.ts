import {EntityRepository} from "../../entity-repository";
import {Entity} from "../../entity";
import {MySqlTable} from "drizzle-orm/mysql-core";
import {type MySql2Database} from "drizzle-orm/mysql2";
import {MaterializeIt} from "@affinity-lab/awqrd-util/materialize-it";
import {stmt} from "../../helper";
import {and, not, sql, Table} from "drizzle-orm";
import {tagError} from "./helper/error";
import type {MaybeArray} from "@affinity-lab/awqrd-util/types";
import type {Dto} from "../../types";
import {type State} from "@affinity-lab/awqrd-util/process-pipeline";
import {debugLog} from "@affinity-lab/awqrd-storm/error";

type Usage = { "repo": EntityRepository<any, any, any>, "field": string } & Record<string, any>
// type Tag<T extends new (...args: any) => any, FIELDS extends Record<string, any> = {name: string}> = GeneralItem<T & FIELDS>

// TODO test this, and add groupTags
export class TagRepository<DB extends MySql2Database<any>, SCHEMA extends MySqlTable, ENTITY extends typeof Entity> extends EntityRepository<DB, SCHEMA, ENTITY> {
	protected usages: Array<Usage> = []

	public addUsage(usage: MaybeArray<Usage>) {
		this.usages.push(...(Array.isArray(usage) ? usage : [usage]));
	}

	@MaterializeIt
	private get stmt_getByName() {
		return stmt<{ names: Array<string> }, Array<any>>( // TODO typehint
			this.db.select().from(this.schema).where(sql`name IN (${sql.placeholder("names")})`)
		)
	}

	async getByName(names: Array<string> | string, asArray: boolean = false){ // TODO typehint
		if(typeof names === "string") names = [names];
		if(names.length === 0) return asArray ? [] : undefined;
		let tags = await this.stmt_getByName({names});
		if(!asArray && tags.length <= 1) return tags[0];
		else return tags;
	}

	public prepare(repository: EntityRepository<any, any, any>, state: State) {
		let values = state.dto;
		for (let usage of this.usages) {
			if (usage.repo === repository) {
				if (!values[usage.field]) values[usage.field] = "";
				values[usage.field] = [...new Set((values[usage.field] as string).trim().split(',').map(x => x.trim()).filter(x => !!x))].join(',');
			}
		}
	}

	protected changes(repository: EntityRepository<any, any, any>, state: State): { prev: Array<string>, curr: Array<string> } {
		let values = state.dto;
		let originalItem = state.prevDto;

		if (!originalItem) throw tagError.itemNotFound(repository.constructor.name);
		let prev: Array<string> = [];
		let curr: Array<string> = []
		for (let usage of this.usages) {
			if (usage.repo === repository) {
				prev.push(...(originalItem[usage.field] ? originalItem[usage.field].split(',') : []));
				curr.push(...(values[usage.field] ? (values[usage.field] as string).split(',') : []));
			}
		}
		prev = [...new Set(prev)];
		curr = [...new Set(curr)];
		return {prev, curr};
	}

	async updateTag(repository: EntityRepository<any, any, any>, state: State) {
		console.log("-------------------- UPDATE TAG")
		let {prev, curr} = this.changes(repository, state);
		await this.addTag(curr.filter(x => !prev.includes(x)));
		await this.deleteTag(prev.filter(x => !curr.includes(x)));
	}

	protected async addTag(names: Array<string>): Promise<void> { // TODO typehint
		console.log("-------------------- ADD TAG START:", names);
		let items = await this.getByName(names, true).then(r=>(r! as Array<any>).map(i=>i.name))
		let toAdd = names.filter(x => !items.includes(x));
		for (let tag of toAdd) {
			let item = (await this.instantiate({name: tag} as unknown as Dto<SCHEMA>))! // TODO this typehint is pretty oof
			await this.insert(item);
			debugLog(item.$export());
		}
		console.log("-------------------- ADD TAG END");
	}

	// DELETE ----------------------------------------

	protected async deleteTag(names: Array<string>): Promise<void> {
		console.log("-------------------- DELETE TAG START:", names);
		let items = await this.getByName(names, true)
		if(items.length === 0) return;
		await this.deleteItems(items);
		console.log("-------------------- DELETE TAG END");
	}

	protected async deleteItems(items: Array<any>) { // TODO typehint
		console.log("ITEMS", items)
		for (let item of items) {
			console.log("ITEM", item)
			let doDelete = true;
			for (let usage of this.usages) {
				let res = await usage.repo.db.select().from(usage.repo.schema).where(sql`FIND_IN_SET(${item.name}, ${usage.repo.schema[usage.field]})`).limit(1).execute();
				if (res.length !== 0) {
					doDelete = false;
					break;
				}
			}
			if (doDelete) {
				await this.delete(item.id);
				await this.deleteInUsages(item.name);
			}
		}
	}

	async deleteInUsages(name: string): Promise<void> {
		name = `${name}`
		for (let usage of this.usages) {
			let set: Record<string, any> = {}
			set[usage.field] = sql`trim(both ',' from replace(concat(',', ${usage.repo.schema[usage.field]} , ','), ',${name},', ','))`;
			usage.repo.db.update(usage.repo.schema).set(set).where(sql`FIND_IN_SET("${name}", ${usage.repo.schema[usage.field]})`);
		}
	}

	// ------------------------------------------

	protected doRename(oldName: string, newName: string) {
		for (let usage of this.usages) {
			let set: Record<string, any> = {};
			set[usage.field] = sql`trim(both ',' from replace(concat(',', ${usage.field} , ','), ',${oldName},', ',${newName},'))`;
			usage.repo.db.update(usage.repo.schema).set(set).where(and(sql`FIND_IN_SET("${oldName}", ${usage.field})`, not(sql`FIND_IN_SET("${newName}", ${usage.field})`)));
			set[usage.field] = sql`trim(both ',' from replace(concat(',', ${usage.field} , ','), ',${oldName},', ','))`;
			usage.repo.db.update(usage.repo.schema).set(set).where(and(sql`FIND_IN_SET("${oldName}", ${usage.field})`, sql`FIND_IN_SET("${newName}", ${usage.field})`));
		}
	}

	async selfRename<T extends Table<any> = any>(state: State) {
		let values = state.dto;
		let originalItem = state.prevDto;
		if (values.name && values.name !== originalItem.name) {
			await this.doRename(originalItem.name, values.name);
		}
	}

	async rename(oldName: string, newName: string): Promise<void> {
		// TODO call from sapphire
		oldName = oldName.replace(',', "").trim();
		newName = newName.replace(',', "").trim();
		if (oldName === newName) return
		let o = await this.getByName(oldName);
		if (!o) return
		let n = await this.getByName(newName);
		let item = Array.isArray(o) ? o[0] : o;
		if (!n) {
			item.name = newName // todo typehint
			await this.update(item)
		}
		else await this.delete(item);
		await this.doRename(oldName, newName);
	}


}




