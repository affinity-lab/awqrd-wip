import type {Context} from "hono";
import {type Middleware, type MiddlewareFn, Pipeline} from "../../util/pipeline.ts";

type Command<Instance extends Object, MethodName extends keyof Instance> = {
	instance: Instance, // The object that contains the method to be executed
	key: MethodName, // The name of the method to be executed on the instance
	config: Record<string, any> // Configuration options for the method execution
	name: string // The name of the command
}

export type State = {
	id: string
	ctx: Context
	args: Record<string, any>
	cmd: Command<any, any>
	client: Client
	env: Record<string, any>
	files: Record<string, Array<File>>
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

	authApi(apiKey: string | undefined) { return true; }

	protected async execute(state: State) { return state.cmd.instance[state.cmd.key](state.args, state.env, state.ctx, this); }

	async resolve(command: string, ctx: Context) {
		let cmd = this.#commands[command];
		return await this.pipeline.run({ctx, args: {}, cmd, client: this, env: {}, id: this.id + "." + command, files: {}});
	}

	add(name: string, instance: any, key: string, config: Record<string, any>) {
		if (this.#commands[name] !== undefined) throw Error(`Parse error: DUPLICATE COMMAND ${name}`);
		this.#commands[name] = {instance, key, config, name};
	}
}