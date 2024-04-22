import type {Middleware} from "../../util/pipeline.ts";
import type {CometState} from "../client/client.ts";

export class RenderMiddleware implements Middleware {
	async middleware(state: CometState, next: Function) {
		try {
			return state.ctx.json(await next())
		} catch (e) {
			console.error(e)
			return state.ctx.json({error: e}, 500)
		}
	}
}