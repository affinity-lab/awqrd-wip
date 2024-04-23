import type {Cache} from "@affinity-lab/awqrd-util/cache/cache.ts";

export type ResultCacheFn = (res: (Record<string, any> | Array<Record<string, any>>)) => Promise<Record<string, any> | Array<Record<string, any>>>

export function resultCacheFactory(cache: Cache, mapCache?: Cache, ...fields: string[]): ResultCacheFn {
	return async (res: Record<string, any> | Array<Record<string, any>>) => {
		if (Array.isArray(res)) {
			await cache.set(res.map(dto => {return {key: dto.id, value: dto} }));
			if (mapCache && fields.length > 0) {
				for (const item of res) for (const field of fields) {
					mapCache.set({key: `<${field}>:${item[field]}`, value: item.id})
				}
			}
		} else {
			await cache.set({key: res.id, value: res});
			if (mapCache && fields.length > 0) {
				for (const field of fields) {
					await mapCache.set({key: `<${field}>:${res[field]}`, value: res.id})
				}
			}
		}
		return res;
	}
}