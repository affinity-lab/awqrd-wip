import type {Context} from "hono";

export async function recognizeClient(ctx: Context, next: () => void) {
	let name: string | undefined = ctx.req.header("client")
	let version: string | undefined = ctx.req.header("client-version")
	let apiKey: string | undefined = ctx.req.header("client-api-key")
	if (name === undefined || version === undefined) await next();
	ctx.set("comet-client", {name, version: parseInt(version!), apiKey});
	await next();
}
