import {ClientGroup} from "@affinity-lab/awqrd/comet/client/client-group.ts";
import {CacheMiddleware} from "@affinity-lab/awqrd/comet/middlewares/cache.ts";
import {FetchArgsMiddleware} from "@affinity-lab/awqrd/comet/middlewares/fetch-args.ts";
import {PreprocessMiddleware} from "@affinity-lab/awqrd/comet/middlewares/preprocess.ts";
import {RenderMiddleware} from "@affinity-lab/awqrd/comet/middlewares/render.ts";
import {ValidateMiddleware} from "@affinity-lab/awqrd/comet/middlewares/validate.ts";
import {services} from "../services.ts";
import {MobileClient} from "./mobile-client.ts";

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
	// admin: new ClientGroup(
	// 	new AdminClient(1)
	// ),
	// web: new ClientGroup(
	// 	new WebClient(1)
	// )
}