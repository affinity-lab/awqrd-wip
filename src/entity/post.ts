import {type Dto, Entity, type EntityInitiator, EntityRepository, Export, type Item, likeString, MaterializeIt, type MaybeNull, stmt} from "@affinity-lab/awqrd";
import {like, sql} from "drizzle-orm";
import {services} from "../lib/services.ts";
import {post} from "./+schema.ts";

class PostRepository<
	DB extends typeof services.connection,
	SCHEMA extends typeof post,
	ENTITY extends EntityInitiator<ENTITY, typeof Post>
> extends EntityRepository<DB, SCHEMA, ENTITY> {

	@MaterializeIt
	private get stmt_find() {
		return stmt<{ search: string }, Array<Dto<SCHEMA>>>(this.db.select().from(post).where(like(post.title, sql.placeholder("search"))))
	}

	async find(search: string): Promise<Array<Item<ENTITY>>> {
		return search === "" ? []
			: await this.stmt_find({search: likeString.startsWith(search)})
				.then((res) => this.instantiateAll(res))
	}
}

export class Post extends Entity implements Partial<Dto<typeof post>> {
	@Export title: MaybeNull<string> = null
	body: MaybeNull<string> = null
}

let repository = new PostRepository(services.connection, post, Post);

export {repository as postRepository}
