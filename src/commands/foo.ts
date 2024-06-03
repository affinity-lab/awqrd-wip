import {Comet, cometError, type CometState} from "@affinity-lab/comet";
import {z, ZodObject} from "zod";
import {User} from "../entity/user.ts";
import {FooBase} from "./foo-base.ts";

function auth(state: CometState) {
	state.env.user = "elvis presley"
}
function allowOnlyIfUserExists(state: CometState) {
	if (!state.env.user) throw cometError.unauthorized()
}


function validateArgs(z: ZodObject<any>) {
	return (state: CometState) => {
		let parsed = z.parse(state.args);
		if (!parsed.success) throw cometError.validation(parsed.error.issues);
		state.args = {...state.args, ...parsed.data};
	}
}

@Comet.Group({name: "foo"})
export class Foo extends FooBase {
	@Comet.Command({
		name: "barz",
		preprocess: [
			auth,
			allowOnlyIfUserExists,
			validateArgs(z.object({name: z.number().gt(2000)}))
		]
	})
	async baz(
		@Comet.Args args: { id: number },
		@Comet.Env env: { user: string },
	) {
		let user =
			await User.repository.get(1)
		return {
			user: user?.$pick("name", "email"),
			auth: env.user
		}
	}
}
