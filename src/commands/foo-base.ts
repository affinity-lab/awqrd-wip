import type {Context} from "hono";
import {Client} from "../awqrd/comet/client/client.ts";
import {Comet} from "../awqrd/comet/comet.ts";
import {clients} from "../lib/clients/clients.ts";



@Comet.Group({
	name: "foo.base",
	cache: true
})
export class FooBase {
	@Comet.Command({
		name: "bar",
		xxx:123,
		cache: {ttl:11},
	})
	bar(args:{fasz:string}, c: Context, client: Client) {
		return {name:args.fasz}
	}
}
