import {like, sql} from "drizzle-orm";
import NodeCache from "node-cache";
import {z} from "zod";
import {likeString, stmt} from "../awqrd/storm/helper.ts";
import {omitFieldsIP} from "../awqrd/util/object.ts";
import {user} from "./!schema.ts";
import {services} from "../lib/services.ts";
import {Entity} from "../awqrd/storm/entity.ts";
import {EntityRepository} from "../awqrd/storm/entity-repository.ts";
import {Export} from "../awqrd/storm/export.ts";
import {BasicCollection} from "./collection-types/basic-collection.ts";
import {DocumentCollection} from "./collection-types/document-collection.ts";
import {ImageCollection} from "../awqrd/storm-plugins/storage-extensions/image/image-collection.ts";
import {cachePlugin} from "../awqrd/storm-plugins/cache/cache-plugin.ts";
import {validatorPlugin} from "../awqrd/storm-plugins/validator/validator-plugin.ts";
import type {Dto, Item} from "../awqrd/storm/types.ts";
import {CacheWithNodeCache} from "../awqrd/util/cache/cache-with-node-cache.ts";
import {MaterializeIfDefined, MaterializeIt} from "../awqrd/util/materialize-it";
import type {MaybeNull} from "../awqrd/util/types";


class UserRepository<
	DB extends typeof services.connection,
	SCHEMA extends typeof user,
	ENTITY extends typeof User
> extends EntityRepository<DB, SCHEMA, ENTITY> {
	initialize() {
		cachePlugin(this, new CacheWithNodeCache(new NodeCache(), 30, 'user'));
		validatorPlugin(this, z.object({
			name: z.string().min(3)
		}));
	}

	@MaterializeIt
	private get stmt_find() {
		return stmt<{ search: string }, Array<User>>(
			this.db.select().from(this.schema).where(like(user.name, sql.placeholder("search")))
		)
	}

	async find(search: string): Promise<Array<Item<ENTITY>>> {
		return search === "" ? [] :
			await this.stmt_find({search: likeString.contains(search)})
				.then((res) => this.instantiateAll(res))
	}

	protected transformSaveDTO(dto: Dto<SCHEMA>) {
		super.transformSaveDTO(dto);
		omitFieldsIP(dto, "createdAt", "updatedAt", "password");
	}

	protected transformItemDTO(dto: Dto<SCHEMA>) {
		super.transformItemDTO(dto);
		omitFieldsIP(dto, "password")
	}
}

export class User extends Entity implements Partial<Dto<typeof user>> {
	async savePassword(password: string) { await repository.overwrite(this, {password})}
	@Export name: MaybeNull<string> = null
	@Export email: MaybeNull<string> = null
	@Export updatedAt: MaybeNull<Date> = null

	@Export @MaterializeIfDefined get images() {return imgCollection.handler(this)}
	@Export @MaterializeIfDefined get docs() {return docCollection.handler(this)}
	@Export @MaterializeIfDefined get general() {return generalCollection.handler(this)}

	@services.MethodCache(3)
	async q(){
		return new Date();
	}
}


// EXPORT REPOSITORY ---
let repository = new UserRepository(services.connection, user, User);
export {repository as userRepository}
let collectionsGroup = services.storage.getGroupDefinition("user", repository);
let imgCollection = new ImageCollection("images", collectionsGroup, {limit: {size: "14mb", count: Infinity}, mime: "image/*"})
let docCollection = new DocumentCollection("doc", collectionsGroup, {limit: {size: "14mb", count: Infinity}})
let generalCollection = new BasicCollection("general", collectionsGroup, {limit: {size: "14mb", count: Infinity}})
