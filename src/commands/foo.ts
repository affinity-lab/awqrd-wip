import {z} from "zod";
import {Client} from "../awqrd/comet/client/client.ts";
import {Comet} from "../awqrd/comet/comet.ts";
import {FooBase} from "./foo-base.ts";



@Comet.Group({name:"realFoo"})
export class Foo extends FooBase {
	@Comet.Command({
		cache: {ttl: 1000},
		preprocess: (args: Record<string, any>) => {args.x = "y";},
		validate: z.object({fasz: z.string()})
	})
	bar2(args:{fasz:string}, c: any, client: Client) {
		return {name:args.fasz + "!!!"}

	}
}
