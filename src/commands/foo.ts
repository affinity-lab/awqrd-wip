import {type Client, Comet, cometError, type CometState} from "@affinity-lab/comet";
import {z} from "zod";
import {User} from "../entity/user.ts";
import {FooBase} from "./foo-base.ts";

function auth(state: CometState) {
	state.env.user = "elvis presley"
}
function allowOnlyIfUserExists(state: CometState) {
	if (!state.env.user) throw cometError.unauthorized()
}

@Comet.Group({name: "foo"})
export class Foo extends FooBase {
	@Comet.Command({
		name: "bazzzzz",
		preprocess: [
			auth,
			allowOnlyIfUserExists,
		],
		validate: z.object({id: z.number().gte(100)})
	})
	async baz(
		@Comet.Env env: any,
		@Comet.Args args: { id: number },
	) {
		let user = await User.repository.get(args.id)
		return user?.$export();
	}


}
