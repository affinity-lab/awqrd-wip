import type {Result} from "@affinity-lab/comet";
import {stormImgServer, stormStorageServer} from "@affinity-lab/storm-storage-server-bun-hono";
import {type Context, Hono} from "hono";
import {cors} from "hono/cors";
import {logger} from "hono/logger";
import * as path from "path";
import type {StatusCode} from "hono/utils/http-status";
import {clients} from "./lib/clients/clients.ts";
import {config, dbg, services} from "./lib/services.ts";

dbg.hello();

// run migrations
await services.migrator();

// load commands and attach them to clients
clients.readCommands(path.resolve(__dirname, "commands/**"))

// create hono app
const app = new Hono()
// add logger to hono
app.use(logger(dbg.req.bind(dbg)));
// enable cors on all requests
app.use('/*', cors())

// add file server endpoint
stormStorageServer(app, services.config.storage.filePath, services.config.storage.fileUrlPrefix);
// add image server endpoint
stormImgServer(app, services.config.storage.imgPath, services.config.storage.imgUrlPrefix, services.config.storage.filePath);

// create the command endpoint
app.post('/api/:command',
	async (ctx: Context<Record<string, any>>) => {
		// find the client based on the client information
		return clients.get(ctx)
			// and resolve the command with the client found
			.then(client => client.resolve(ctx.req.param("command"), ctx))
			// send out the response
			.then((result: Result) => ctx.json(result.result, result.status as StatusCode))
	}
);

// serve the hono app
Bun.serve({fetch: app.fetch, port: services.config.server.port});

if(config.app.mode !== 'prod') clients.describe();
dbg.msg(`Server is up and running!\n PORT: ${config.server.port}`);

