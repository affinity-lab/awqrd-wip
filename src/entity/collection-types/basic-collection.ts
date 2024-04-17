import {type MetaField} from "../../awqrd/storm-plugins/storage/helper/types.ts";
import {Collection} from "../../awqrd/storm-plugins/storage/collection.ts";

export class BasicCollection extends Collection {
	async setTitle(id: number, filename: string, title: string) { await this.updateMetadata(id, filename, {title});}
}
