import {omitFields, omitFieldsIP} from "../storm/tools.ts";
import type {ClientGroup} from "./client/client-group.ts";
import type {Client} from "./client/client.ts";
import {Comet} from "./comet.ts";

export function readCommands(clients: Record<string, ClientGroup>) {

	let allClients = [];
	for (const key in clients) allClients.push(...clients[key].all());

	Comet.classMetaData.stores.forEach((store) => {
		let classConfig = Comet.classMetaData.read(store.target, {flatten: false, simple: true});

		if (classConfig === undefined) throw Error() // TODO
		let group = classConfig["group"];

		let cometInstance = new (store.target as new () => any)(); // TODO typehint

		for (const key in classConfig["command"]) {
			let name = ((group["name"] || store.target.name) + "." + (classConfig["command"][key]["name"] || key)).toLowerCase();
			let clients = classConfig["command"][key]["clients"] || group["clients"] || allClients;
			clients.forEach((client:Client) => {
				client.add(name, cometInstance, key, omitFields(classConfig["command"][key], "name", "clients"))
			});
		}

		console.log("FASZI!", Comet.classMetaData.read(store.target, {flatten: false, simple: true}))
	})
}
