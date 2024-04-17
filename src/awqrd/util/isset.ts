import type {EmptyArray, NonEmptyArray} from "./types.ts";

/**
 * Checks if a value is defined and not null.
 * @param {*} item - The value to check.
 * @returns {boolean} True if the value is defined and not null, false otherwise.
 */
export function isSet(item: null): false;
export function isSet(item: undefined): false;
export function isSet(item: NonNullable<any>): true;
export function isSet(item: any): boolean { return item !== undefined && item !== null;}

/**
 * Checks if an array is empty, undefined, or null.
 * @param {Array<any> | undefined | null} item - The array to check.
 * @returns {boolean} True if the array is empty, undefined, or null; otherwise, false.
 */
export function isEmpty(item: null): false;
export function isEmpty(item: undefined): false;
export function isEmpty(item: EmptyArray): false;
export function isEmpty(item: NonEmptyArray<any>): true;
export function isEmpty(item: Array<any> | undefined | null): boolean { return item === undefined || item === null || item.length === 0;}