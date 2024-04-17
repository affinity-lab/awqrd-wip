import {ClientGroup} from "../../awqrd/comet/client/client-group.ts";
import {AdminClient} from "./admin-client.ts";
import {MobileClient} from "./mobile-client.ts";
import {WebClient} from "./web-client.ts";

export let clients: Record<string, ClientGroup> = {
	mobile: new ClientGroup(
		new MobileClient(1)
	),
	admin: new ClientGroup(
		new AdminClient(1)
	),
	web: new ClientGroup(
		new WebClient(1)
	)
}