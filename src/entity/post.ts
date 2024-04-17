import {like, sql} from "drizzle-orm";
import {post} from "./!schema.ts";
import {services} from "../lib/services.ts";
import {Entity} from "../awqrd/storm/entity.ts";
import {EntityRepository} from "../awqrd/storm/entity-repository.ts";
import {likeString, stmt} from "../awqrd/storm/tools.ts";
import type {Dto, Item} from "../awqrd/storm/types.ts";
import {MaterializeIt} from "../awqrd/util/materialize-it";
import type {MaybeNull} from "../awqrd/util/types";

class PostRepository<
	DB extends typeof services.connection,
	SCHEMA extends typeof post,
	ENTITY extends typeof Post
> extends EntityRepository<DB, SCHEMA, ENTITY> {
	@MaterializeIt
	private get stmt_find() { return stmt<{ search: string }, Array<Dto<SCHEMA>>>(this.db.select().from(post).where(like(post.title, sql.placeholder("search"))))}
	async find(search: string): Promise<Array<Item<ENTITY>>> {
		return search === "" ? []
			: await this.stmt_find({search: likeString.startsWith(search)})
				.then((res) => this.instantiateAll(res))
	}
}

export class Post extends Entity implements Partial<Dto<typeof post>> {
	title: MaybeNull<string> = null
	body: MaybeNull<string> = null
}

let repository = new PostRepository(services.connection, post, Post);

export {repository as postRepository}
