import type {Middleware} from "../../util/pipeline.ts";
import type {CometState} from "../client/client.ts";

export class PreprocessMiddleware implements Middleware {
	async middleware(state: CometState, next: Function) {
		if (typeof state.cmd.config.preprocess === "function") state.cmd.config.preprocess(state);
		if (Array.isArray(state.cmd.config.preprocess)) state.cmd.config.preprocess.forEach(preprocess => preprocess(state));
		return await next()
	}
}