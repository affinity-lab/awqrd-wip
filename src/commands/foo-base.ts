import {Comet, type CometState} from "@affinity-lab/comet";
import {clients} from "../lib/clients/clients.ts";

@Comet.Group({
	name: "foo.base",
})
export class FooBase {

	@Comet.Command({
		clients: clients.client("mobile", 1)
	})
	bar(@Comet.Args args: { name: string }) {
		return {name: args.name.toUpperCase()}
	}


	@Comet.Command({
		name: "bar",
		clients: clients.client("mobile", 2)
	})
	bar2({args}: CometState & {
		args: { name: string }
	}) {
		return {name: args.name}
	}
}
