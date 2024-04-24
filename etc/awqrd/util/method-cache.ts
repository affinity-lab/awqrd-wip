import crypto from "crypto";
import {Cache} from "./cache/cache.ts";

/**
 * Factory function to create a method decorator that caches the result of the method
 * @param {Cache} cacheService - The cache service to use for storing and retrieving cached values
 * @returns {MethodDecorator} - The method decorator function
 */
export function methodCacheFactory(cacheService: Cache): (ttl: number) => MethodDecorator {
	/**
	 * Method decorator that caches the result of the decorated method
	 * @param {number} ttl - Time-to-live for the cached value in milliseconds
	 * @returns {MethodDecorator} - The method decorator
	 */
	return function (ttl: number): MethodDecorator {
		/**
		 * Actual method decorator function that wraps the original method with caching logic
		 * @param {any} target - The target object
		 * @param {string} propertyKey - The property key
		 * @param {PropertyDescriptor} descriptor - The property descriptor
		 * @returns {PropertyDescriptor} - The updated property descriptor with caching logic
		 */
		return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
			const innerFunction = target[propertyKey];
			const id = crypto.randomUUID();
			return {
				...descriptor,
				/**
				 * Cached method that checks if the result is already cached, otherwise calls the original method
				 * @param {any[]} args - Arguments passed to the method
				 * @returns {Promise<any>} - The cached or newly computed result
				 */
				async value(...args: any[]): Promise<any> {
					let key = id + crypto.createHash('md5').update(JSON.stringify(args)).digest("hex")
					let cached: any = await cacheService.get(key);
					if (cached) return cached;
					let value = await innerFunction.apply(this, args);
					await cacheService.set({key, value}, ttl);
					return value;
				}
			};
		} as MethodDecorator;
	};
}