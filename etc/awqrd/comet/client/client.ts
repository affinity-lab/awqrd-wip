import type {Context} from "hono";
import {type Middleware, type MiddlewareFn, Pipeline} from "@affinity-lab/awqrd-util/pipeline.ts";

type Command<Instance extends Object, MethodName extends keyof Instance> = {
	instance: Instance, // The object that contains the method to be executed
	key: MethodName, // The name of the method to be executed on the instance
	config: Record<string, any> // Configuration options for the method execution
	name: string // The name of the command
	params: string[] // The names of the parameters that the method accepts
}

export type CometState = {
	args: Record<string, any>
	env: Record<string, any>
	files: Record<string, Array<File>>
	id: string
	ctx: Context
	cmd: Command<any, any>
	client: Client
}

export abstract class Client {
	#commands: Record<string, Command<any, any>> = {};
	readonly id: string = crypto.randomUUID();
	private pipeline: Pipeline<any, any>;

	constructor(
		public readonly version: number,
		middlewares: Array<MiddlewareFn | Middleware> = []
	) {
		this.pipeline = new Pipeline(...middlewares, this.execute.bind(this));
	}

	authApi(apiKey: string | undefined) { apiKey; return true; }

	protected async execute(state: CometState) {
		// todo: create an array of the properties of state from the key of the cmd.params

		let args = [];
		if (state.cmd.params.length === 0) {
			args.push(state);
		} else for (let param of state.cmd.params) {
			args.push(state[param as keyof CometState])
		}


		return state.cmd.instance[state.cmd.key](...args);
	}

	async resolve(command: string, ctx: Context) {
		let cmd = this.#commands[command];
		return await this.pipeline.run({ctx, args: {}, cmd, client: this, env: {}, id: this.id + "." + command, files: {}});
	}

	add(name: string, instance: any, key: string, config: Record<string, any>, params: string[]) {
		if (this.#commands[name] !== undefined) throw Error(`Parse error: DUPLICATE COMMAND ${name}`);
		this.#commands[name] = {instance, key, config, name, params};
	}
}