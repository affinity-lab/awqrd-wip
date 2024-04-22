import {z} from "zod";
import type {CometState} from "../awqrd/comet/client/client.ts";
import {Comet} from "../awqrd/comet/comet.ts";
import {cometError} from "../awqrd/comet/error.ts";
import {FooBase} from "./foo-base.ts";

function auth(state:CometState){
	state.env.user = "elvis presley"
}
function allowOnlyIfUserExiss(state:CometState){
	if(!state.env.user) throw cometError.unauthorized()
}

@Comet.Group({name: "foo"})
export class Foo extends FooBase {
	@Comet.Command({
		preprocess: [
			auth,
			allowOnlyIfUserExiss,
			(state: CometState) => { state.args.fasz = state.args.fasz + "xxx"}
		],
		validate: z.object({fasz: z.string().min(3)}),
	})

	baz(
		@Comet.Args args: { fasz: string },
		@Comet.Env env: any,
	) {
		console.log(env)
		return {name: args.fasz + "!!!" + env.user}
	}
}
