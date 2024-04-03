import {blank} from "../schema/blank.ts";
import {factory} from "../services/factory";
import {Entity} from "../storm/entity";
import {EntityRepository} from "../storm/entity-repository";
import type {Dto} from "../storm/types";

class BlankRepository<
	DB extends typeof factory.connection,
	SCHEMA extends typeof blank,
	ENTITY extends typeof Blank
> extends EntityRepository<DB, SCHEMA, ENTITY> {}

export class Blank extends Entity implements Partial<Dto<typeof blank>> {}

let repository = new BlankRepository(factory.connection, blank, Blank);

export {repository as blankRepository}
