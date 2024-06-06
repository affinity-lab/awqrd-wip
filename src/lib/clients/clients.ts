import {ClientGroup} from "@affinity-lab/comet";
import {CacheMiddleware, PreprocessMiddleware, RenderMiddleware, ValidateMiddleware} from "@affinity-lab/comet";
import {dbg, services} from "../services.ts";
import {AdminClient} from "./admin-client.ts";
import {MobileClient} from "./mobile-client.ts";
import {WebClient} from "./web-client.ts";
import {FetchArgsMiddleware, Clients} from "@affinity-lab/comet-hono-bun";

let middlewares = [
	new RenderMiddleware((error: any) => {
		dbg.log(error)
		return undefined
	}),
	new FetchArgsMiddleware(),
	new PreprocessMiddleware(),
	new ValidateMiddleware(),
	new CacheMiddleware(services.responseCache)
];

export let clients = new Clients({
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