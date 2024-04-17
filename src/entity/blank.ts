import {blank} from "./!schema.ts";
import {services} from "../services/services.ts";
import {Entity} from "../awqrd/storm/entity.ts";
import {EntityRepository} from "../awqrd/storm/entity-repository.ts";
import type {Dto} from "../awqrd/storm/types.ts";

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

