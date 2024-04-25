import {createErrorData, preprocessErrorTree} from "@affinity-lab/awqrd-util/extended-error.ts";

export const tagError = {
	itemNotFound: (repository: string) =>
		createErrorData("item not found", {repository}, 404),
};

preprocessErrorTree(tagError, "STORM_TAG");