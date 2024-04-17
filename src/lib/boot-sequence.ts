import {Hono} from "hono";
import path from "path";
import {readCommands} from "../awqrd/comet/read-commands.ts";
import {loadModuleDefaultExports} from "../awqrd/util/load-module-default-exports.ts";
import {clients} from "./clients/clients.ts";
import {services} from "./services.ts";


export async function bootSequence() {
	await services.migrator();
	const app = new Hono();
	loadModuleDefaultExports(path.resolve(__dirname, "../commands/"));
	readCommands(clients)
	return {app}
}
