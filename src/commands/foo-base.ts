import {type CometState} from "../awqrd/comet/client/client.ts";
import {Comet} from "../awqrd/comet/comet.ts";


@Comet.Group({
	name: "foo.base",
	cache: true
})
export class FooBase {
	@Comet.Command({
		name: "bar",
		xxx: 123,
		cache: {ttl: 11},
	})
	bar(args: { fasz: string }, env: Record<string, any>, files: Record<string, Array<File>>, state: CometState) {
		return {name: args.fasz}
	}
}
