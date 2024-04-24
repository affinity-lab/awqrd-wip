import {cometError} from "../error.ts";
import type {ClientGroup} from "./client-group.ts";

export function getClient(clients: Record<string, ClientGroup>, name: string, version: number, apiKey: string | undefined) {
	if (name === undefined || version === undefined) throw cometError.client.noInfo();
	if (clients[name] === undefined) throw cometError.client.notFound(name, version);
	let client = clients[name].get(version);
	if (client === undefined) throw cometError.client.notFound(name, version);
	if(!client.authApi(apiKey)) throw cometError.client.notAuthorized(name, version);
	return client;
}