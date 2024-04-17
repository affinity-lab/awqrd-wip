import {ClientGroup} from "../../awqrd/comet/client/client-group.ts";
import {CacheMiddleware} from "../../awqrd/comet/middlewares/cache.ts";
import {FetchArgsMiddleware} from "../../awqrd/comet/middlewares/fetch-args.ts";
import {PreprocessMiddleware} from "../../awqrd/comet/middlewares/preprocess.ts";
import {RenderMiddleware} from "../../awqrd/comet/middlewares/render.ts";
import {ValidateMiddleware} from "../../awqrd/comet/middlewares/validate.ts";
import {services} from "../services.ts";
import {MobileClient} from "./mobile-client.ts";

export let clients: Record<string, ClientGroup> = {
	mobile: new ClientGroup(
		new MobileClient(1, [
			new RenderMiddleware(),
			new FetchArgsMiddleware(),
			new PreprocessMiddleware(),
			new ValidateMiddleware(),
			new CacheMiddleware(services.responseCache)
		]),
	),
	// admin: new ClientGroup(
	// 	new AdminClient(1)
	// ),
	// web: new ClientGroup(
	// 	new WebClient(1)
	// )
}