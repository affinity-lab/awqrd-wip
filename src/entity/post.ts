import {Entity, type EntityFields, EntityRepository, Export, likeString, stmt} from "@affinity-lab/storm";
import {type MaybeNull} from "@affinity-lab/util";
import {like, sql} from "drizzle-orm";
import {services} from "../lib/services.ts";
import {post} from "./+schema.ts";


class Repository extends EntityRepository<typeof post, Post> {

	private stmt_find = stmt<{ search: string }, Array<Post>>(
		this.db.select().from(post).where(like(post.title, sql.placeholder("search"))),
		this.instantiate.all
	)

	async find(search: string): Promise<Array<Post>> {
		return search === "" ? []
			: await this.stmt_find({search: likeString.startsWith(search)})
	}
}

export class Post extends Entity implements EntityFields<typeof post> {

	static repository: Repository

	@Export title: MaybeNull<string> = null
	body: MaybeNull<string> = null
}


let repository = new Repository(services.connection, post, Post);
