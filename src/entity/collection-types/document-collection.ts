import {type MetaField} from "../../awqrd/storm-plugins/storage/helper/types.ts";
import {Collection} from "../../awqrd/storm-plugins/storage/collection.ts";
import type {Storage} from "../../awqrd/storm-plugins/storage/storage.ts";

type DocumentCollectionMetadata = { title: string }

export class DocumentCollection extends Collection<DocumentCollectionMetadata> {
	public writableMetaFields: Record<string, MetaField> = {title: {type: "string"}};
}
