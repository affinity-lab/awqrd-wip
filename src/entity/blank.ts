import {Entity, type EntityFields, EntityRepository} from "@affinity-lab/storm";
import {services} from "../lib/services.ts";
import {blank} from "./+schema.ts";


class Repository extends EntityRepository<typeof blank, Blank> {}

export class Blank extends Entity implements EntityFields<typeof blank> {
	static repository: Repository;
}

new Repository(services.connection, blank, Blank);