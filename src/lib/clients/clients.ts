import {Client, ClientGroup, Clients, cometError, FetchArgsMiddleware} from "@affinity-lab/comet";
import {CacheMiddleware, PreprocessMiddleware, RenderMiddleware, ValidateMiddleware} from "@affinity-lab/comet";
import {dbg, services} from "../services.ts";
import {AdminClient} from "./admin-client.ts";
import {MobileClient} from "./mobile-client.ts";
import {WebClient} from "./web-client.ts";
import {type Context} from "hono";
import {reform} from "reformdata";

let middlewares = [
	new RenderMiddleware((error: any) => {
		dbg.log(error)
		return undefined
	}),
	new FetchArgsMiddleware(
		async (ctx: Context) => {
			let contentType = ctx.req.header("Content-type");
			let args: any = {}, params: any = {}, files: any = {};
			if (contentType === "application/json") {
				args = await ctx.req.json();
			} else if (contentType?.startsWith("multipart/form-data")) {
				let reformData = reform(await ctx.req.formData()) as Record<string, any>
				for (let arg in reformData) {
					if (reformData[arg] instanceof File) files[arg] = [reformData[arg]];
					else if (Array.isArray(reformData[arg]) && reformData[arg][0] instanceof File) files[arg] = reformData[arg];
					else args[arg] = reformData[arg];
				}
			} else {
				throw cometError.contentTypeNotAccepted(contentType ?? "undefined")
			}
			params = ctx.req.query();
			return {files, args, params}
		}
	),
	new PreprocessMiddleware(),
	new ValidateMiddleware(),
	new CacheMiddleware(services.responseCache)
];

class HonoClients<G extends string = string> extends Clients<G> {
	async get(ctx: any): Promise<Client> {
		let name: string | undefined = ctx.req.header("client");
		let version: string | undefined = ctx.req.header("client-version");
		let apiKey: string | undefined = ctx.req.header("client-api-key");
		return await this.find(name, version, apiKey);
	}
}


// NOTE: THIS IS JUST AN EXAMPLE
export let clients = new HonoClients({
	mobile: new ClientGroup(
		new MobileClient(1, middlewares, false),
		new MobileClient(2, middlewares),
	),
	admin: new ClientGroup(
		new AdminClient(1, middlewares)
	),
	web: new ClientGroup(
		new WebClient(1, middlewares)
	)
})