import crypto from "crypto";
import type {Cache} from "../../util/cache/cache.ts";
import type {Middleware} from "../../util/pipeline.ts";
import type {State} from "../client/client.ts";

export class CacheMiddleware implements Middleware {

	constructor(
		private cache: Cache,
		private defaultTtl: number = 60,
		private defaultKeyFn: (state: State) => string | Record<string, any> = (state: State) => { return {id: state.id, args: state.args, env: state.env}}
	) {}

	async middleware(state: State, next: Function) {
		if (!state.cmd.config.cache) return await next();

		let key = (state.cmd.config.cache.key === undefined) ? this.defaultKeyFn(state) : state.cmd.config.cache.key(state);
		if (typeof key !== "string") key = crypto.createHash("md5").update(JSON.stringify(key)).digest("hex");

		let cached = await this.cache.get(key)
		if (cached) {return cached}
		let value = await next()
		await this.cache.set({key, value}, state.cmd.config.cache.ttl??this.defaultTtl)
		return value;
	}
}