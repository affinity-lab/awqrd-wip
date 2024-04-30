import {type EntityInitiator, EntityRepository} from "@affinity-lab/awqrd";
import {Entity} from "@affinity-lab/awqrd";
import {Export} from "@affinity-lab/awqrd";
import {likeString, stmt} from "@affinity-lab/awqrd";
import {cachePlugin} from "@affinity-lab/awqrd";
import {cachedGetByFactory} from "@affinity-lab/awqrd";
import {resultCacheFactory} from "@affinity-lab/awqrd";
import {ImageCollection} from "@affinity-lab/awqrd";
import {validatorPlugin} from "@affinity-lab/awqrd";
import type {Dto} from "@affinity-lab/awqrd";
import {CacheWithNodeCache} from "@affinity-lab/awqrd";
import {MaterializeIfDefined, MaterializeIt} from "@affinity-lab/awqrd";
import {omitFieldsIP} from "@affinity-lab/awqrd";
import type {MaybeNull} from "@affinity-lab/awqrd";
import {like, sql} from "drizzle-orm";
import {z} from "zod";
import {services} from "../lib/services.ts";
import {user} from "./+schema.ts";
import {BasicCollection} from "./collection-types/basic-collection.ts";
import {DocumentCollection} from "./collection-types/document-collection.ts";
import {tagPlugin} from "@affinity-lab/awqrd";
import {tagRepository} from "./tag";
import {TagRepository} from "@affinity-lab/awqrd";

let cache = new CacheWithNodeCache(services.entityCache, 30, 'user');
let mapCache = new CacheWithNodeCache(services.entityCache, 30, 'user.map');
let resultCache = resultCacheFactory(cache, mapCache, "email")


class UserRepository<
	DB extends typeof services.connection,
	SCHEMA extends typeof user,
	ENTITY extends EntityInitiator<ENTITY, typeof User>
> extends EntityRepository<DB, SCHEMA, ENTITY> {
	initialize() {
		cachePlugin(this, cache, resultCache);
		validatorPlugin(this, z.object({
			name: z.string().min(3)
		}));
		tagPlugin(this, tagRepository as unknown as TagRepository<any, any, any>, "role") // TODO typehint
	}

	@MaterializeIt
	private get stmt_find() {
		return stmt<{ search: string }, Array<User>>(
			this.db.select().from(this.schema).where(like(user.name, sql.placeholder("search"))),
			resultCache,
			this.instantiators.all
		)
	}

	async find(search: string): Promise<Array<User>> {
		return search === "" ? [] : await this.stmt_find({search: likeString.contains(search)})
	}


	getByEmail = cachedGetByFactory<string, User>(this, "email", resultCache, mapCache)


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
	@Export name: MaybeNull<string> = null;
	@Export email: MaybeNull<string> = null;
	@Export updatedAt: MaybeNull<Date> = null;
	@Export role: MaybeNull<string> = null;

	@Export @MaterializeIfDefined get images() {return imgCollection.handler(this)}
	@Export @MaterializeIfDefined get docs() {return docCollection.handler(this)}
	@Export @MaterializeIfDefined get general() {return generalCollection.handler(this)}

	@services.MethodCache(3)
	async q(arg: number) { return new Date();}
}


// EXPORT REPOSITORY ---
let repository = new UserRepository(services.connection, user, User);
export {repository as userRepository}
let collectionsGroup = services.storage.getGroupDefinition("user", repository);
let imgCollection = new ImageCollection("images", collectionsGroup, {limit: {size: "14mb", count: Infinity}, mime: "image/*"})
let docCollection = new DocumentCollection("doc", collectionsGroup, {limit: {size: "14mb", count: Infinity}})
let generalCollection = new BasicCollection("general", collectionsGroup, {limit: {size: "14mb", count: Infinity}})