import type {Context} from "hono";
import {Client} from "../awqrd/comet/client/client.ts";
import {Comet} from "../awqrd/comet/comet.ts";
import {clients} from "../services/clients/clients.ts";



@Comet.Group({
	name: "foo.fisz",
	cache: true
})
export class FooBase {
	@Comet.Command({
		name: "bar.baz",
		xxx:123,
		cache: {ttl:11},
		preprocess:()=>{},
		validate: z.object({})
		// pipeline: [
		// 	PerformanceMeasure,
		// 	Authenticate(),
		// 	PreprocessMiddleware(...),
		// 	ValidateMiddleware(z.object({})),
		// 	Guard(()=>{}),
		// 	CacheMiddleware({ttl:1000}),
		// 	I18n
		// ],
	})
	bar(args:{fasz:string}, c: Context, client: Client) {
		return {name:args.fasz}
	}
}
