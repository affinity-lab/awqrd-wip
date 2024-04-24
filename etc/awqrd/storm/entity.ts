import {omitFieldsIP, pickFieldsIP} from "@affinity-lab/awqrd-util/object.ts";
import {type MaybeUnset} from "@affinity-lab/awqrd-util/types.ts";
import {Export} from "./export.ts";

/**
 * Class representing a storm entity.
 */
export class Entity {
	/** The ID of the entity. */
	@Export declare id: MaybeUnset<number>;

	$export() {
		const e: Record<string, any> = {}
		for (const key of this.constructor.prototype.export) e[key] = this[key as keyof this];
		return e
	}
	$pick(...fields: string[]) {
		let res = this.$export();
		pickFieldsIP(res, ...fields);
		return res;
	}
	$omit(...fields: string[]) {
		let res = this.$export();
		omitFieldsIP(res, ...fields);
		return res;
	}
}


