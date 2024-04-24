import {type MetaField} from "@affinity-lab/awqrd/storm/plugins/storage/helper/types.ts";
import {Collection} from "@affinity-lab/awqrd/storm/plugins/storage/collection.ts";

type DocumentCollectionMetadata = { title: string }

export class DocumentCollection extends Collection<DocumentCollectionMetadata> {
	public writableMetaFields: Record<string, MetaField> = {title: {type: "string"}};
}
