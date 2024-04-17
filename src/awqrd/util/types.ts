export type ConstructorOf<CLASS> = new (...args: any[]) => CLASS;
export type MaybePromise<TYPE> = TYPE | Promise<TYPE>;
export type MaybeArray<TYPE> = TYPE | Array<TYPE>
export type MaybeUndefined<TYPE> = TYPE | undefined;
export type MaybeNull<TYPE> = TYPE | null;
export type MaybeUnset<TYPE> = TYPE | null | undefined;
export type NonEmptyArray<T = any> = [T, ...T[]];
export type EmptyArray = [];
export type NumericString = `${number}`;
export type Numeric = NumericString|number;