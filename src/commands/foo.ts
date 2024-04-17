import {z} from "zod";
import {Comet} from "../awqrd/comet/comet.ts";
import {FooBase} from "./foo-base.ts";


@Comet.Group({name: "foo"})
export class Foo extends FooBase {
	@Comet.Command({
		preprocess: (args: any) => { args.fasz = args.fasz + "xxx"},
		validate: z.object({fasz: z.string().min(3)}),
	})
	baz(args: { fasz: string }) {
		return {name: args.fasz + "!!!"}
	}
}
