import {type Collection} from "./collection.ts";
import type {AttachmentObject} from "./helper/types.ts";

export class Attachment<METADATA extends Record<string, any>> implements AttachmentObject {

	#collection: Collection<METADATA>;
	#entityId: number
	#name: string
	#id: string
	#size: number
	#metadata: METADATA
	public metadata: METADATA
	get size(): number {return this.#size}
	get id(): string {return this.#id}
	get name(): string {return this.#name}
	get collection(): Collection<METADATA> {return this.#collection}
	get entityId(): number {return this.#entityId}

	constructor(attachmentObject: AttachmentObject, collection: Collection<METADATA>, entityId: number) {
		this.#entityId = entityId
		this.#collection = collection
		this.#name = attachmentObject.name
		this.#id = attachmentObject.id
		this.#size = attachmentObject.size
		this.#metadata = attachmentObject.metadata as METADATA
		this.metadata = new Proxy<METADATA>(this.#metadata, {
			get: (target, prop) => target[prop.toString()],
			set: (target, prop, value) => {
				let p = prop.toString() as keyof METADATA;
				if (collection.writableMetaFields.hasOwnProperty(p)) {
					target[p] = value;
					return true;
				}
				return false;
			}
		})
	}

	toJSON(){
		return{
			metadata: this.#metadata,
			name: this.name,
			id: this.id,
			size: this.#size,
		}
	}

	async saveMetaData() {
		await this.collection.storage.updateMetadata(this.collection.name, this.entityId, this.name, this.#metadata)
	}
	async setPositions(position: number) {
		await this.collection.storage.setPosition(this.collection.name, this.entityId, this.name, position);
	}
	async delete() {
		await this.collection.storage.delete(this.collection.name, this.entityId, this.name)
	}
	async rename(name: string) {
		await this.collection.storage.rename(this.collection.name, this.entityId, this.name, name)
	}
}

