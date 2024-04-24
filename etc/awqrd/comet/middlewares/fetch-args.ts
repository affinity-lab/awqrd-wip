import {reform} from "reformdata";
import type {Middleware} from "@affinity-lab/awqrd-util/pipeline.ts";
import type {CometState} from "../client/client.ts";
import {cometError} from "../error.ts";

export class FetchArgsMiddleware implements Middleware {
	async handle(state: CometState, next: Function) {
		let contentType = state.ctx.req.header("Content-type");

		if (contentType === "application/json") {
			state.args = await state.ctx.req.json();
		} else if (contentType?.startsWith("multipart/form-data")) {
			let reformData = reform(await state.ctx.req.formData()) as Record<string, any>
			for (let arg in reformData) {
				if (reformData[arg] instanceof File) state.files[arg] = [reformData[arg]];
				else if (Array.isArray(reformData[arg]) && reformData[arg][0] instanceof File) state.files[arg] = reformData[arg];
				else state.args[arg] = reformData[arg];
			}
		} else {
			throw cometError.contentTypeNotAccepted(contentType?? "undefined")
		}

		return await next()
	}
}
