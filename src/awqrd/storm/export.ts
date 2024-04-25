import {ClassMetaData} from "@affinity-lab/awqrd-util/class-meta-data";


export function Export(target: any, name: PropertyKey,): void {
	Export.metadata.get(target.constructor, true).push("export", name);
}

Export.metadata = new ClassMetaData()
