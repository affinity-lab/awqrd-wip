import fg from "fast-glob";
import path from "path";

/**
 * Loads default exports from modules in a specified directory.
 * @template T - The type of the default export.
 * @param {string} dir - The directory containing the modules.
 * @returns {Array<T>} An array of default exports from the loaded modules.
 */
export function loadModuleDefaultExports<T = any>(dir: string) {
	const modules: Array<T> = [];
	const records = fg.globSync(path.join(dir + "/*.{ts,js}").replaceAll("\\", "/"));
	records.map(async (filename: string) => {
		let module: T = require(filename).default;
		modules.push(module);
	});
	return modules;
}