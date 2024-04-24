import type {Client} from "./client.ts";

export class ClientGroup {

	private clients: Client[];

	constructor(...clients: Array<Client>) {
		this.clients = clients;
	}

	get(version: number): Client | undefined {
		return this.clients.find((client) => client.version === version);
	}

	all() {return this.clients}

	range(from: number = 0, to?: number): Client[] {
		const selectedVersions: Client[] = [];
		for (const client of this.clients) {
			if (client.version >= from && (!to || client.version <= to)) {
				selectedVersions.push(client);
			}
		}
		return selectedVersions;
	}

	pick(...versions: number[]): Client[] {
		if (versions.length === 0) return [];
		const requestedVersions: Client[] = [];
		for (const version of versions) {
			if (this.clients.some((client) => client.version === version)) {
				requestedVersions.push(this.clients.find((client) => client.version === version)!);
			}
		}
		return requestedVersions;
	}

	omit(...versions: number[]): Client[] {
		if (versions.length === 0) return this.clients;
		const omittedVersions: Client[] = [];
		for (const client of this.clients) {
			if (!versions.includes(client.version)) {
				omittedVersions.push(client);
			}
		}
		return omittedVersions;
	}

	filter(predicate: (client: Client) => boolean): Client[] {
		return this.clients.filter(predicate);
	}

	last(): Client | undefined {
		return this.clients[this.clients.length-1];
	}
}
