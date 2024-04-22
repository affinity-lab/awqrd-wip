import {omitFieldsIP, pickFieldsIP} from "../util/object.ts";
import {type MaybeUnset} from "../util/types.ts";

/**
 * Class representing a storm entity.
 */
export class Entity {
	/** The ID of the entity. */
	declare id: MaybeUnset<number>;

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


