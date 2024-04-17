export function Export(
	target: any,
	name: PropertyKey,
): void {
	if (!Array.isArray(target["export"])) target["export"] = [];
	target.export.push(name);
}