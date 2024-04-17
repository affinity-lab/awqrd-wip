import type {Context} from "hono";

export async function recognizeClient(c: Context, next: () => void) {
	let name: string | undefined = c.req.header("client")
	let version: string | undefined = c.req.header("Client-Version")
	if (name === undefined || version === undefined) await next();
	c.set("comet-client", {name, version: parseInt(version!)});
	await next();
}
