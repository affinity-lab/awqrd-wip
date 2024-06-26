import {MaterializeIfDefined} from "@affinity-lab/util";
import {type Dto, Entity, type EntityFields, EntityRepository, Export, Import, likeString, stmt} from "@affinity-lab/storm";
import {cachedGetByFactory, cachePlugin, ResultCacheWithMaps} from "@affinity-lab/storm-cache";
import {validatorPlugin} from "@affinity-lab/storm-validator";
import {CacheWithNodeCache, type MaybeNull, omitFieldsIP} from "@affinity-lab/util";
import {eq} from "drizzle-orm";
import {z} from "zod";
import {services} from "../lib/services.ts";
import {BasicCollection, DocumentCollection, ImageCollection} from "./+collection-types.ts";
import {user} from "./+schema.ts";

class Repository extends EntityRepository<typeof user, User> {

	private cache = new ResultCacheWithMaps(
		new CacheWithNodeCache(services.entityCache, 30, 'user'),
		new CacheWithNodeCache(services.entityCache, 30, 'user.map'),
		["email"]
	)

	protected initialize() {
		this
			.addPlugin(cachePlugin(this.cache))
			.addPlugin(validatorPlugin(z.object({name: z.string().min(3)})))
			.addPlugin(services.storage.plugin())
	}

	private stmt = {
		search: stmt<{ search: string }, Array<User>>(
			this.db.select().from(this.schema).where(eq(this.schema.id, 1)),
			this.cache.setter,
			this.instantiate.all
		),
		find: stmt<{ search: string }, Array<User>>(
			this.db.select().from(this.schema).where(eq(this.schema.id, 1)),
			this.instantiate.all
		)
	}


	public async search(search: string) { return this.stmt.search({search})}
	public async find(search: string): Promise<Array<User>> { return search === "" ? [] : await this.stmt.find({search: likeString.contains(search)})}
	public getByEmail = cachedGetByFactory<string, User>(this, "email", this.cache)

	protected transformSaveDTO(dto: Dto<typeof user>) {
		super.transformSaveDTO(dto);
		omitFieldsIP(dto, "createdAt", "updatedAt", "password");
	}

	protected transformItemDTO(dto: Dto<typeof user>) {
		super.transformItemDTO(dto);
		omitFieldsIP(dto, "password")
	}
}


export class User extends Entity implements EntityFields<typeof user> {

	static repository: Repository;

	async savePassword(password: string) { await this.$overwrite({password})}

	@Export @Import name: MaybeNull<string> = null;
	@Export @Import email: MaybeNull<string> = null;
	@Export updatedAt: MaybeNull<Date> = null;
	role: MaybeNull<string> = null;

	@Export get myRoles() {return this.role?.split(",")}

	@Export @MaterializeIfDefined get images() {return imgCollection.handler(this)}
	@Export @MaterializeIfDefined get docs() {return docCollection.handler(this)}
	@Export @MaterializeIfDefined get general() {return generalCollection.handler(this)}

	@services.MethodCache(3)
	async q(arg: number) { return new Date();}
}


let repository = new Repository(services.connection, user, User)
let collectionsGroup = services.storage.getGroupDefinition("user", repository);
let imgCollection = new ImageCollection("images", collectionsGroup, {limit: {size: "14mb", count: Infinity}, mime: "image/*"})
let docCollection = new DocumentCollection("doc", collectionsGroup, {limit: {size: "14mb", count: Infinity}})
let generalCollection = new BasicCollection("general", collectionsGroup, {limit: {size: "14mb", count: Infinity}})