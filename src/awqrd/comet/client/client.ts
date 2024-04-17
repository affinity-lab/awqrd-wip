import type {Context} from "hono";
import {services} from "../../../services/services.ts";
import type {CometCommandConfig} from "../comet.ts";

// type Command<KEY extends string = string> = {instance: Object & {}, key: KEY, config: Record<string, any>}

type Command<Instance extends Object, MethodName extends keyof Instance> = {
	instance: Instance, // The object that contains the method to be executed
	key: MethodName, // The name of the method to be executed on the instance
	config: Record<string, any> // Configuration options for the method execution
}

export abstract class Client {
	#commands: Record<string, Command<any, any>> = {};
	#id: string = crypto.randomUUID();

	constructor(public readonly version: number) {}

	prepare(command: string, args: Record<string, any> | FormData, config: CometCommandConfig) {
		if(config.preprocess !== undefined) config.preprocess(args);
		if(config.zod !== undefined) {
			let parsed = config.zod.safeParse(args);
			if (!parsed.success) throw Error("Validation extended-error") // TODO (parsed.error.issues)
			return parsed.data;
		}
		if(config.cache) {

		}
	}

	finalize(command: string, res: any, args: Record<string, any>) {
		services.responseCache.set({key: command+JSON.stringify(args), value: res})
	}

	async resolve(command: string, c: Context) {

		let com = this.#commands[command];
		let args: Record<string, any> | FormData;

		switch (c.req.header("Content-type")) {
			case "application/json":
				args = await c.req.json();
				break;
			case "multipart/form-data":
				args = await c.req.formData();
				break;
			default:
				throw Error("ContentType not accepted") // TODO
		}

		this.prepare(command, args, com.config);
		let res = com.instance[com.key](args, c, this);
		this.finalize(command, res, args);
		return c.json(res);
	}
	add(name: string, instance: any, key: string, config: Record<string, any>) {
		if (this.#commands[name] !== undefined) throw Error(`Parse error: DUPLICATE COMMAND ${name}`)
		this.#commands[name] = {instance, key, config};
		console.log(this.#commands)
	}
}