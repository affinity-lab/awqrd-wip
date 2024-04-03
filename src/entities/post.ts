import {like, sql} from "drizzle-orm";
import {post} from "../schema/post";
import {factory} from "../services/factory";
import {Entity} from "../storm/entity";
import {EntityRepository} from "../storm/entity-repository";
import {likeString, stmt} from "../storm/tools";
import type {Dto, Item} from "../storm/types";
import {MaterializeIt} from "../util/materialize-it";
import type {MaybeNull} from "../util/types";

class PostRepository<
	DB extends typeof factory.connection,
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

let repository = new PostRepository(factory.connection, post, Post);

export {repository as postRepository}
