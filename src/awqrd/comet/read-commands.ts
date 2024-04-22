import {omitFields, omitFieldsIP} from "../storm/tools.ts";
import type {ClientGroup} from "./client/client-group.ts";
import type {Client} from "./client/client.ts";
import {Comet} from "./comet.ts";

export function readCommands(clients: Record<string, ClientGroup>) {

	let allClients = [];
	for (const key in clients) allClients.push(...clients[key].all());

	Comet.classMetaData.stores.forEach((store) => {
		let config = Comet.classMetaData.read(store.target, {flatten: false, simple: true});

		if (config === undefined) throw Error("Config not found for " + store.target.name + ". Did you forget to add the @Comet decorator?");
		let group = config["group"];

		let cometInstance = new (store.target as new () => any)(); // TODO typehint

		for (const key in config["command"]) {
			let name = ((group["name"] || store.target.name) + "." + (config["command"][key]["name"] || key)).toLowerCase();
			let clients = config["command"][key]["clients"] || group["clients"] || allClients;

			clients.forEach((client:Client) => {
				config["command"][key] = omitFields(config["command"][key], "name", "clients")
				client.add(name, cometInstance, key, config["command"][key])
			});
		}
	})
}

