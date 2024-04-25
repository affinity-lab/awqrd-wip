import {CacheMiddleware, ClientGroup, FetchArgsMiddleware, PreprocessMiddleware, RenderMiddleware, ValidateMiddleware} from "@affinity-lab/awqrd";
import {services} from "../services.ts";
import {AdminClient} from "./admin-client.ts";
import {MobileClient} from "./mobile-client.ts";
import {WebClient} from "./web-client.ts";

let middlewares = [
	new RenderMiddleware(),
	new FetchArgsMiddleware(),
	new PreprocessMiddleware(),
	new ValidateMiddleware(),
	new CacheMiddleware(services.responseCache)
];

export let clients: Record<string, ClientGroup> = {
	mobile: new ClientGroup(
		new MobileClient(1, middlewares),
		new MobileClient(2, middlewares),
	),
	admin: new ClientGroup(
		new AdminClient(1)
	),
	web: new ClientGroup(
		new WebClient(1)
	)
}