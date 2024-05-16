dbg.hello();

import {getClient, readCommands, recognizeClient} from "@affinity-lab/comet";
import {stormImgServerHono, stormStorageServerHono} from "@affinity-lab/storm";
import {type Context, Hono} from "hono";
import {logger} from "hono/logger";
import * as path from "node:path";
import {clients} from "./lib/clients/clients.ts";
import {dbg, services} from "./lib/services.ts";

// run migrations
await services.migrator();

// load commands and attach them to clients
readCommands(path.resolve(__dirname, "commands/"), clients);

// create hono app
const app = new Hono();
// add logger to hono
app.use(logger(dbg.req.bind(dbg)));

// add file server endpoint
stormStorageServerHono(app, services.config.storage.filePath, services.config.storage.fileUrlPrefix);
// add image server endpoint
stormImgServerHono(app, services.config.storage.imgPath, services.config.storage.imgUrlPrefix, services.config.storage.filePath, true);

// create the command enpoint
app.post('/api/:command',
	// recognize the client (this implementation collects client information from the request headers and stores it in the context object)
	recognizeClient,
	async (ctx: Context<Record<string, any>>) => {
		let {name, version, apiKey}: { name: string, version: number, apiKey: string } = ctx.get("comet-client");
		// find the client based on the client information
		let client = getClient(clients, name, version, apiKey);
		// resolve the command with the client
		return client.resolve(ctx.req.param("command"), ctx);
	}
);

// serve the hono app
Bun.serve({fetch: app.fetch, port: services.config.server.port});


dbg.msg("Server is up and running!\nhttp://localhost:3000/");



