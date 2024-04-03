import {like, sql} from "drizzle-orm";
import NodeCache from "node-cache";
import {z} from "zod";
import {user} from "../schema/user";
import {factory} from "../services/factory";
import {Entity} from "../storm/entity";
import {EntityRepository} from "../storm/entity-repository";
import {cachePlugin} from "../storm/plugins/cache-plugin.ts";
import {validatorPlugin} from "../storm/plugins/validator-plugin.ts";
import {likeString, omitFields, stmt} from "../storm/tools";
import type {Dto, Item} from "../storm/types";
import {CacheWithNodeCache} from "../util/cache/cache-with-node-cache.ts";
import {MaterializeIt} from "../util/materialize-it";
import type {MaybeNull} from "../util/types";

export class User extends Entity implements Partial<Dto<typeof user>> {
	async savePassword(password: string) { await repository.overwrite(this, {password})}
	name: MaybeNull<string> = null
	email: MaybeNull<string> = null
	updatedAt: MaybeNull<Date> = null
}

class UserRepository<
	DB extends typeof factory.connection,
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
		omitFields(dto, "createdAt", "updatedAt", "password");
	}

	protected transformItemDTO(dto: Dto<SCHEMA>) {
		super.transformItemDTO(dto);
		omitFields(dto, "password")
	}
}

// EXPORT REPOSITORY ---
let repository = new UserRepository(factory.connection, user, User)
export {repository as userRepository}
