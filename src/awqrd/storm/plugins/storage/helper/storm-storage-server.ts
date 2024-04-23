import {Hono} from "hono";
import {serveStatic} from "hono/bun";

export function filePathFromUrl(path: string) {
	let segments = path.split('/');
	let file = segments.pop();
	let collection = segments.pop()!;
	segments = collection.split(".");
	let c_id = segments.pop()!;
	let c_name = segments.join(".")!;
	return `${c_name}/${c_id.slice(0, 2)}/${c_id.slice(2, 4)}/${c_id.slice(4, 6)}/${file}`;
}

//todo: Add guards option
export function stormStorageServerHono(app: Hono, path: string, prefix: string) {
	app.get(
		`${prefix}*`,
		serveStatic({
			root: path,
			rewriteRequestPath: (path: string) => filePathFromUrl(path)
		}),
	)
}