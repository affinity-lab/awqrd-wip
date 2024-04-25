console.log("\n\n💥💥💥 ST0RM ###########################################################")

import {getClient, readCommands, recognizeClient, stormImgServerHono, stormStorageServerHono} from "@affinity-lab/awqrd";
import {type Context, Hono} from "hono";
import {logger} from "hono/logger";
import path from "path";
import {User, userRepository} from "./entity/user.ts";
import {clients} from "./lib/clients/clients.ts";
import {services} from "./lib/services.ts";


await services.migrator();
readCommands(path.resolve(__dirname, "commands/"), clients);


const app = new Hono();
app.use(logger());

stormStorageServerHono(app, process.env["PATH_FILES"]!, process.env["URL_FILES_PREFIX"]!);
stormImgServerHono(app, process.env["PATH_IMG"]!, process.env["URL_IMAGES_PREFIX"]!, process.env["PATH_FILES"]!, true)

let user: User | undefined;


let users = await userRepository.find("elvis")
// console.log(users)
user = await userRepository.get(16)
// console.log(user);
console.log(user!.$pick("name"));
user = await userRepository.getByEmail("elvis@elvis.hu");
console.log(user!.$omit("name"));
user = await userRepository.getByEmail("elvis@elvis.hu");
console.log(user!.$export());
// let images = await user!.images!.load()
// images.findFiles("*.jpg")[0]!.delete();

console.log(user!.$export());

app.post('/api/:command',
	recognizeClient,
	async (ctx: Context<Record<string, any>>) => {
		let {name, version, apiKey}: { name: string, version: number, apiKey: string } = ctx.get("comet-client");
		let client = getClient(clients, name, version, apiKey);
		return client.resolve(ctx.req.param("command"), ctx);
	});


Bun.serve({
	fetch: app.fetch,
	port: process.env["PORT"]
});


//
// let user = await userRepository.get(16);
// let users = await userRepository.get([13, 16, 19]);
// user = await userRepository.get(16);
// user = await userRepository.get(16);
// user = await userRepository.get(16);
// user = await userRepository.get(16);
// user = await userRepository.get(16);
// user = await userRepository.get(16);


// console.log(await user!.q())
// setInterval(async ()=>console.log(await user!.q()), 1000)

//
// if (user) {
// 	user.name = "Hxe";
// 	user.email = Math.random().toString();
// 	await userRepository.save(user);
// 	await user.savePassword("gecicsepp")
// 	console.log(user);
// 	// await user.images!.add(await lib.tmpFile.createFromFilePath(path.join(process.env["PATH_ETC"]!, "patreon-mpu.png"), false))
// 	// user.images!.setMetadata("asdf", {title: "Hello"});
// 	//
// 	await user.images!.load();
//
// 	// let file = user.images![0]
// 	// file.metadata.focus = "centre";
// 	//  await file.saveMetaData();
// 	// //
// 	// user.images![0].delete();
//
//
// 	//file.metadata.title = "Hello ITT A METADATA2";
// 	//console.log(file)
// 	//await file.saveMetaData();
// 	//console.log((await user.images!.get())
//
// 	// (await user.images!.get()).first()!.metadata.focus = "centre";
// 	// (await user.images!.get()).first()!.metadata.width;
//
// 	// (await user.images!.get()).findFiles(/.*\.webp$/)
//
// 	console.log(
// 		JSON.stringify(user.$pick("name", "images"), null, 2)
// 	)
// console.log(path.resolve(process.env["PATH_FILES"]!))
// }


// app.post('/upload', async (c) => {
// 	const body = await c.req.parseBody();
// 	const files = body["f[]"]
// 	if (Array.isArray(files)) {
// 		await Promise.all(files.map(async (file) => {
// 			if (file instanceof File) {
// 				if (fs.existsSync(`${__dirname}/${file.name}`)) fs.unlinkSync(`${__dirname}/${file.name}`);
// 				await fs.promises.writeFile(`${__dirname}/${file.name}`, Buffer.from(await file.arrayBuffer()))
// 			}
// 		}));
// 	}
// 	return c.body("OK")
// });