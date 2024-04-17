import type {State} from "../../awqrd/comet/client/client.ts";
import type {Middleware} from "../../awqrd/util/pipeline.ts";


export class EnvMiddleware implements Middleware {
	async middleware(state: State, next: Function) {
		if (state.cmd.config.auth === true) {
			state.env.auth = "józsi";
		}
		if (state.cmd.config.event === true) {
			state.env.event = "fasza";
		}
		return await next()
	}
}

