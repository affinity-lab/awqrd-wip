import {Entity} from "@affinity-lab/awqrd-storm/entity.ts";
import {Export} from "@affinity-lab/awqrd-storm/export.ts";
import type {Dto} from "@affinity-lab/awqrd-storm/types.ts";
import type {MaybeNull} from "@affinity-lab/awqrd-util/types";
import {services} from "../lib/services.ts";
import {tag} from "./+schema.ts";
import {TagRepository} from "@affinity-lab/awqrd-storm/plugins/tag/tag-repository";



export class TagTestRepository<
	DB extends typeof services.connection,
	SCHEMA extends typeof tag,
	ENTITY extends typeof Tag
> extends TagRepository<DB, SCHEMA, ENTITY> {

}

export class Tag extends Entity implements Partial<Dto<typeof tag>> {
	@Export name: MaybeNull<string> = null
}


// EXPORT REPOSITORY ---
let repository = new TagTestRepository(services.connection, tag, Tag);
export {repository as tagRepository}
