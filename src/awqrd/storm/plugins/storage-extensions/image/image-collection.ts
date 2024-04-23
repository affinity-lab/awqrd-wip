import {FileDescriptor} from "@affinity-lab/awqrd-util/fs/file-descriptor.ts";
import type {IEntityRepository} from "../../../entity-repository-interface.ts";
import {Collection} from "../../storage/collection.ts";
import {type CollectionOptions, type MetaField, type TmpFile} from "../../storage/helper/types.ts";
import type {Storage} from "../../storage/storage.ts";
import {type ImgFocus, imgFocusOptions, type ImgRGB} from "./types.ts";

type ImageAttachmentMetadata = {
	title?: string
	focus: ImgFocus
	readonly width?: number
	readonly height?: number
	readonly color?: ImgRGB
	readonly animated: boolean
}

export class ImageCollection extends Collection<ImageAttachmentMetadata> {
	public readonly writableMetaFields: Record<string, MetaField> = {
		title: {type: "string"},
		focus: {type: "enum", options: imgFocusOptions}
	}

	constructor(name: string,
		groupDefinition: {
			storage: Storage,
			group: string,
			entityRepository: IEntityRepository
		},
		rules: CollectionOptions) {
		super(name, groupDefinition, rules);
		this.rules.ext = [".png", ".webp", ".gif", ".jpg", ".jpeg", ".tiff"]
	}

	protected async prepareFile(file: TmpFile): Promise<{ file: TmpFile; metadata: ImageAttachmentMetadata }> {
		const descriptor = new FileDescriptor(file.file);
		let img = await descriptor.image;

		return {
			file, metadata: {
				width: img?.meta.width,
				height: img?.meta.height,
				color: img?.stats.dominant,
				animated: (img?.meta.pages) ? img.meta.pages > 1 : false,
				focus: "entropy"
			}
		};
	}
}
