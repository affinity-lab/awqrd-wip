dbg.hello();


import {User} from "./entity/user.ts";
import {dbg, services} from "./lib/services.ts";
await services.migrator();

let user = await User.repository.search("elvis")

user[0]?.$import({name:"Gecc", email:"GeccGecc", asdfasdfa:2341234});

console.log(user[0]?.$export())
console.log(Date.now())

// readCommands(path.resolve(__dirname, "commands/"), clients);
//
//
// const app = new Hono();
// app.use(logger(dbg.req.bind(dbg)));
// stormStorageServerHono(app, services.config.storage.filePath, services.config.storage.fileUrlPrefix);
// stormImgServerHono(app, services.config.storage.imgPath, services.config.storage.imgUrlPrefix, services.config.storage.filePath, true);
//
// app.post('/api/:command',
// 	recognizeClient,
// 	async (ctx: Context<Record<string, any>>) => {
// 		let {name, version, apiKey}: { name: string, version: number, apiKey: string } = ctx.get("comet-client");
// 		let client = getClient(clients, name, version, apiKey);
// 		return client.resolve(ctx.req.param("command"), ctx);
// 	}
// );
//
// Bun.serve({
// 	fetch: app.fetch,
// 	port: services.config.server.port
// });

// console.log(userRepo.find("elvis"))

// let user = User.repository.find("Hello");

// User

/*let user;
 let users = await userRepository.find("elvis")
 user = await userRepository.get(1)
 dbg.log(user?.$export());
 dbg.log("--------------------------------------------------------")
 let post = await postRepository.get(1)
 // let post = await postRepository.create()
 // post.title = "test"
 // await postRepository.save(post)
 // console.log(post)
 dbg.log(post?.$export())

 // post end ----------------------------------

 // tag --------------------------------------
 let tag = await tagRepository.get(1)
 // let tag = await tagRepository.create()
 // // console.log(tag)
 // tag.name = "alma"
 // await tagRepository.save(tag)
 // console.log(tag)
 dbg.log(tag?.$export())

 // tag end --------------------------------------

 // testing start --------------------------------------

 user!.role = "testTag2,KettesTag";
 // user!.role = "";
 await userRepository.save(user!);
 dbg.log(user?.$export());

 // testing end --------------------------------------
 */


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

