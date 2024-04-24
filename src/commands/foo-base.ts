import type {Context} from "hono";
import type {Client} from "@affinity-lab/awqrd/comet/client/client.ts";
import {Comet} from "@affinity-lab/awqrd/comet/comet.ts";
import {clients} from "../lib/clients/clients.ts";

@Comet.Group({
	name: "foo.base",
})
export class FooBase {


	@Comet.Command({
		name: "bar",
		clients: [...clients.mobile.pick(1)]
	})
	bar2(
		@Comet.Args args: { fasz: string },
		@Comet.Env env: Record<string, any>,
		@Comet.Files files: Record<string, Array<File>>,
		@Comet.Ctx ctx: Context,
		@Comet.Client client: Client
	) {
		return {name: args.fasz}
	}



	@Comet.Command({
		name: "bar",
		clients: clients.mobile.range(2)
	})
	bar(
		@Comet.Files files: Record<string, Array<File>>,
		@Comet.Args args: { fasz: string },
	) {
		return {name: args.fasz}
	}
}
