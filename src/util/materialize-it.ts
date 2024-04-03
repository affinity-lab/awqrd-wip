type GetPropertyDescriptor<T, R> = PropertyDescriptor & { get?: (this: T) => R; }

/** A decorator function that materializes a getter property into a value property after the first access. */
export function MaterializeIt<T, R>(
	target: any,
	name: PropertyKey,
	descriptor: GetPropertyDescriptor<T, R>
): void {
	const getter: ((this: T) => R) | undefined = descriptor.get;
	if (!getter) {
		throw new Error(`Getter property descriptor expected when materializing at ${target.name}::${name.toString()}`);
	}
	descriptor.get = function () {
		const value: R = getter.call(this);
		Object.defineProperty(this, name, {
			configurable: descriptor.configurable as boolean,
			enumerable: descriptor.enumerable as boolean,
			writable: false,
			value
		});
		return value;
	};
}