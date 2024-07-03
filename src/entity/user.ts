import {CacheWithNodeCache, MaterializeIfDefined, type MaybeNull, omitFieldsIP} from "@affinity-lab/util";
import {
	type Dto,
	Entity,
	type EntityFields,
	EntityRepository,
	Export,
	Import,
	likeString,
	stmt,
} from "@affinity-lab/storm";
import {cachedGetByFactory, cachePlugin, ResultCacheWithMaps} from "@affinity-lab/storm-cache";
import {validatorPlugin} from "@affinity-lab/storm-validator";
import {eq, like, sql} from "drizzle-orm";
import {z} from "zod";
import {services} from "../lib/services.ts";
import {BasicCollection, DocumentCollection, ImageCollection} from "./+collection-types.ts";
import {user} from "./+schema.ts";

// NOTE: THIS IS JUST AN EXAMPLE

class Repository extends EntityRepository<typeof user, User> {

	private declare cache;
	private declare stmt: Record<string, Function>;
	public declare getByEmail: Function;

	protected initialize() {
		this.cache = new ResultCacheWithMaps(
			new CacheWithNodeCache(services.entityCache, 30, 'user'),
			new CacheWithNodeCache(services.entityCache, 30, 'user.map'),
			["email"]
		);
		this
			.addPlugin(cachePlugin(this.cache)) // NOTE: enables cache
			.addPlugin(validatorPlugin(z.object({name: z.string().min(3)}))) // NOTE: returns 422 if fails
			.addPlugin(services.storage.plugin()) // NOTE: use this if you have any storage added to you repository


		// NOTE: this can be outside the initialize function if you are not using cache!
		this.stmt = {
			search: stmt<{ search: string }, Array<User>>(
				this.db.select().from(this.schema).where(like(this.schema.email, sql.placeholder("search"))),
				this.cache.setter,
				this.instantiate.all
			),
			find: stmt<{ search: string }, User>(
				this.db.select().from(this.schema).where(eq(this.schema.email, sql.placeholder("search"))),
				this.instantiate.first
			)
		}
		// NOTE: use getByFactory if you are not using cache!
		this.getByEmail = cachedGetByFactory<string, User>(this, "email", this.cache)
	}


	public async search(search: string) {
		return this.stmt.search({search})
	}

	public async find(search: string): Promise<Array<User>> {
		return search === "" ? [] : await this.stmt.find({search: likeString.contains(search)})
	}


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

	async savePassword(password: string) {
		await this.$overwrite({password})
	}

	@Export @Import name: MaybeNull<string> = null;
	@Export @Import email: MaybeNull<string> = null;
	@Export updatedAt: MaybeNull<Date> = null;
	role: MaybeNull<string> = null;

	@Export get myRoles() {
		return this.role?.split(",")
	}

	@Export @MaterializeIfDefined get images() {
		return imgCollection.handler(this)
	}

	@Export @MaterializeIfDefined get docs() {
		return docCollection.handler(this)
	}

	@Export @MaterializeIfDefined get general() {
		return generalCollection.handler(this)
	}

	@services.MethodCache(3)
	async q(arg: number) {
		return new Date();
	}
}


let repository = new Repository(services.connection, user, User)
let collectionsGroup = services.storage.getGroupDefinition("user", repository);
let imgCollection = new ImageCollection("images", collectionsGroup, {
	limit: {size: "14mb", count: Infinity},
	mime: "image/*"
})
let docCollection = new DocumentCollection("doc", collectionsGroup, {limit: {size: "14mb", count: Infinity}})
let generalCollection = new BasicCollection("general", collectionsGroup, {limit: {size: "14mb", count: Infinity}})