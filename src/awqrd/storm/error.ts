import {createErrorData, preprocessErrorTree} from "../util/extended-error";


export const entityError = {
	itemNotFound: (repository: string, id: number | undefined | null) =>
		createErrorData("item not found", {repository, id}, 404),
};

preprocessErrorTree(entityError, "STORM_ENTITY");