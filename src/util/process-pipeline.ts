export class ProcessPipeline {

	readonly #prepare: Array<Function> = []
	readonly #action: Array<Function> = []
	readonly #finalize: Array<Function> = []
	#ctx:undefined|object

	constructor(action?: Function) {
		if(action !== undefined) this.#action.push(action);
	}

	async run(state: Record<string, any>) {
		for (const segment of this.#prepare) await segment.apply(this.#ctx, [state]);
		for (const segment of this.#action) await segment.apply(this.#ctx, [state]);
		for (const segment of this.#finalize) await segment.apply(this.#ctx, [state]);
		return state;
	}

	ctx(ctx: object | undefined) { this.#ctx = ctx; return this;}


	readonly action = {
		prepend: (segment: Function) => {
			this.#action.unshift(segment)
			return this;
		},
		append: (segment: Function) => {
			this.#action.push(segment)
			return this;
		}
	}

	readonly prepare = {
		prepend: (segment: Function) => {
			this.#prepare.unshift(segment)
			return this;
		},
		append: (segment: Function) => {
			this.#prepare.push(segment)
			return this;
		}
	}

	readonly finalize = {
		prepend: (segment: Function) => {
			this.#finalize.unshift(segment)
			return this;
		},
		append: (segment: Function) => {
			this.#finalize.push(segment)
			return this;
		}
	}
}