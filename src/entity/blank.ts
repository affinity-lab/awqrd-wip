import {type Dto, Entity, EntityRepository} from "@affinity-lab/awqrd";
import {services} from "../lib/services.ts";
import {blank} from "./+schema.ts";


/**
 *
 */
class BlankRepository<
	DB extends typeof services.connection,
	SCHEMA extends typeof blank,
	ENTITY extends typeof Blank
> extends EntityRepository<DB, SCHEMA, ENTITY> {}

export class Blank extends Entity implements Partial<Dto<typeof blank>> {}

let repository = new BlankRepository(services.connection, blank, Blank);

export {repository as blankRepository}
