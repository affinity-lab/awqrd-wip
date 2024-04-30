import type {Dto, EntityInitiator, MaybeNull} from "@affinity-lab/awqrd";
import {Entity, Export, TagRepository} from "@affinity-lab/awqrd";
import {services} from "../lib/services.ts";
import {tag} from "./+schema.ts";


export class TagTestRepository<
	DB extends typeof services.connection,
	SCHEMA extends typeof tag,
	ENTITY extends EntityInitiator<ENTITY, typeof Tag>
> extends TagRepository<DB, SCHEMA, ENTITY> {

}

export class Tag extends Entity implements Partial<Dto<typeof tag>> {
	@Export name: MaybeNull<string> = null
}


// EXPORT REPOSITORY ---
let repository = new TagTestRepository(services.connection, tag, Tag);
export {repository as tagRepository}
