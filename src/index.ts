console.log("\n\n💥💥💥 ST0RM ###########################################################")
import type {Context} from "hono";
import {logger} from "hono/logger";
import {getClient} from "./awqrd/comet/client/get-client.ts";
import {recognizeClient} from "./awqrd/comet/client/recognize-client.ts";
import {stormImgServerHono} from "./awqrd/storm-plugins/storage-extensions/image/storage-img-server.ts";
import {stormStorageServerHono} from "./awqrd/storm-plugins/storage/helper/storm-storage-server.ts";
import {bootSequence} from "./services/boot-sequence.ts";
import {clients} from "./services/clients/clients.ts";


let {app} = await bootSequence()
app.use(logger())

stormStorageServerHono(app, process.env["PATH_FILES"]!, process.env["URL_FILES_PREFIX"]!);
stormImgServerHono(app, process.env["PATH_IMG"]!, process.env["URL_IMAGES_PREFIX"]!, process.env["PATH_FILES"]!, true)

app.post('/api/:command',
	recognizeClient,
	async (c: Context<Record<string, any>>, next   ) => {
		let {name, version}: { name: string, version: number } = c.get("comet-client");
		let client = getClient(clients, name, version);
		return client.resolve(c.req.param("command"), c);
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
// 	// await user.images!.add(await services.tmpFile.createFromFilePath(path.join(process.env["PATH_ETC"]!, "patreon-mpu.png"), false))
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