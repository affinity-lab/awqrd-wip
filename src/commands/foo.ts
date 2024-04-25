
import {Comet, cometError, type CometState} from "@affinity-lab/awqrd";
import {userRepository} from "../entity/user.ts";
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
		name:"bazzzzz",
		preprocess: [
			auth,
			allowOnlyIfUserExists,
		],
	})

	async baz(
		@Comet.Env env: any,
		@Comet.Args args: { id: number },
	) {
		let user = await userRepository.get(args.id)
		return user?.$export();
	}



}
