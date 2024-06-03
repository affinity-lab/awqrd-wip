import {Collection as BaseCollection, ImageCollection as BaseImageCollection, type MetaField} from "@affinity-lab/storm-storage";

export class BasicCollection extends BaseCollection {
	async setTitle(id: number, filename: string, title: string) { await this.updateMetadata(id, filename, {title});}
}

export class DocumentCollection extends BaseCollection<{title: string}> {
	public writableMetaFields: Record<string, MetaField> = {title: {type: "string"}};
}

export class ImageCollection extends BaseImageCollection {}