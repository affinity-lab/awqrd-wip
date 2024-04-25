import {Collection, type MetaField} from "@affinity-lab/awqrd";

type DocumentCollectionMetadata = { title: string }

export class DocumentCollection extends Collection<DocumentCollectionMetadata> {
	public writableMetaFields: Record<string, MetaField> = {title: {type: "string"}};
}
