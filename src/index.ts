
console.log("\n\n🔥 ST0RM ###########################################################")
import * as fs from "fs";
import {Hono} from 'hono'
import {userRepository} from "./entities/user.ts";
import {factory} from "./services/factory.ts";

await factory.migrator();

let user = await userRepository.get(16);
let users = await userRepository.get([13,16,19]);
user = await userRepository.get(16);
user = await userRepository.get(16);
user = await userRepository.get(16);
user = await userRepository.get(16);
user = await userRepository.get(16);
user = await userRepository.get(16);
console.log(users)

if (user) {
	user.name = "Hxe";
	user.email = Math.random().toString();
	await userRepository.save(user);
	await user.savePassword("gecicsepp")
	console.log(user)
}

const app = new Hono();

app.get("/", (ctx) => {
	return ctx.json(user)
})

app.post('/upload', async (c) => {
	const body = await c.req.parseBody();
	const files = body["f[]"]
	if (Array.isArray(files)) {
		await Promise.all(files.map(async (file) => {
			if (file instanceof File) {
				if (fs.existsSync(`${__dirname}/${file.name}`)) fs.unlinkSync(`${__dirname}/${file.name}`);
				await fs.promises.writeFile(`${__dirname}/${file.name}`, Buffer.from(await file.arrayBuffer()))
			}
		}));
	}
	return c.body("OK")
});

Bun.serve({
	fetch: app.fetch,
	port: process.env["PORT"]
});
