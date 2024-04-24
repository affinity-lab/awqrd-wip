import {loadModuleDefaultExports} from "@affinity-lab/awqrd-util/load-module-default-exports.ts";
import {omitFields} from "@affinity-lab/awqrd-util/object.ts";
import type {ClientGroup} from "./client/client-group.ts";
import type {Client} from "./client/client.ts";
import {Comet} from "./comet.ts";

export function readCommands(commandsPath: string, clients: Record<string, ClientGroup>) {

	loadModuleDefaultExports(commandsPath);

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

			let params:string[] = [];
			if(config["params"] !== undefined) {
				for (const param in config["params"][key]) {
					params[parseInt(param)] = config["params"][key][param];
				}
			}

			clients.forEach((client:Client) => {
				config["command"][key] = omitFields(config["command"][key], "name", "clients")
				client.add(name, cometInstance, key, config["command"][key], params)
			});
		}
	})
}


