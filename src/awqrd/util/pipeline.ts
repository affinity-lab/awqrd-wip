type MiddlewareFn<T = any> = (state: T, next: () => Promise<any>) => Promise<any>;
type WithMiddleware<T = any> = any & { middleware: MiddlewareFn<T>; };

async function pipeline<STATE = any, RES = any>(
	state: STATE,
	...middlewares: Array<MiddlewareFn<STATE> | WithMiddleware<STATE>>
): Promise<any> {
	let middleware: MiddlewareFn | undefined = middlewares.shift();
	if (middleware === undefined) throw Error('Middleware not found!');
	let next: () => Promise<any> = () => pipeline(state, ...middlewares);
	if (typeof middleware === "function") return await middleware(state, next);
	else if (typeof middleware === "object") return await (middleware as WithMiddleware).middleware(state, next);
	throw new Error("some error occured in pipeline execution")
}


class Pipeline<STATE = any, RES = any> {
	private readonly middlewares: Array<MiddlewareFn<STATE> | WithMiddleware<STATE>>;

	constructor(...middlewares: Array<MiddlewareFn<STATE> | WithMiddleware<STATE>>) {
		this.middlewares = middlewares;
	}
	run(state: STATE): Promise<RES> {
		return pipeline<STATE, RES>(state, ...this.middlewares);
	}
}