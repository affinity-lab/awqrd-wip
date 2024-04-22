import type {Context} from "hono";
import type {Client} from "../awqrd/comet/client/client.ts";
import {Comet} from "../awqrd/comet/comet.ts";

@Comet.Group({
	name: "foo.base",
	cache: true
})
export class FooBase {
	@Comet.Command({
		name: "bar",
		xxx: 123,
		cache: {ttl: 11},
	})
	bar(
		@Comet.Args args: { fasz: string },
		@Comet.Env env: Record<string, any>,
		@Comet.Files files: Record<string, Array<File>>,
		@Comet.Ctx ctx: Context,
		@Comet.Client client: Client
	) {
		return {name: args.fasz}
	}
}
