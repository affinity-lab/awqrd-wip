import type {ClientGroup} from "./client-group.ts";

export function getClient(clients: Record<string, ClientGroup>, name: string, version: number) {
	if (name === undefined || version === undefined) throw new Error("Client and Client-Version headers are required.");
	if (clients[name] === undefined) throw new Error(`Client ${name} is not recognized.`);
	let client = clients[name].get(version);
	if (client === undefined) throw new Error(`Client ${name} v ${version} is not found.`);
	return client;
}