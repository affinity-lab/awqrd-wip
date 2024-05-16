import {Comet, cometError, type CometState} from "@affinity-lab/comet";
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
		preprocess: [auth, allowOnlyIfUserExists],
		validate: z.object({name: z.number().lt(2000)})
	})
	async baz(
		@Comet.Args args: { id: number },
		@Comet.Env env: { user: string },
	) {
		let user = await User.repository.get(args.id)
		return {
			user: user?.$pick("name", "email"),
			auth: env.user
		}
	}
}
