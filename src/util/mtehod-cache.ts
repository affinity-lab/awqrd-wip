import crypto from "crypto";

function MethodCache(ttl?: number): MethodDecorator {
	return (target: Object, propertyKey: string | symbol, descriptor: PropertyDescriptor) => {
		const func = descriptor.value;
		const id = crypto.randomUUID();
		descriptor.value = async function (...args: Array<any>) {
			// const instance = this as unknown as MySqlRepository<any, any>;
			// if (instance.cache === undefined) return await func.call(instance, ...args);
			// const key = crypto.createHash("md5").update(id + JSON.stringify(args)).digest("hex");
			// const item = await instance.cache?.get(key);
			// if (item !== undefined) return item;
			// const result = await func.call(instance, ...args);
			// if (result !== undefined) await instance.cache?.set({key: key, value: result}, ttl);
			// return result;
		};
	};
}