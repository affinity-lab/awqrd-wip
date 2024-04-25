import {Collection} from "@affinity-lab/awqrd";

export class BasicCollection extends Collection {
	async setTitle(id: number, filename: string, title: string) { await this.updateMetadata(id, filename, {title});}
}
