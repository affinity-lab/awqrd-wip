import {createErrorData, preprocessErrorTree} from "@affinity-lab/awqrd-util/extended-error.ts";


export const cometError = {
	client: {
		noInfo: () => createErrorData("Client information not provided."),
		notFound: (name: string, version: number) => createErrorData(`Client not found ${name}(${version})`),
		notAuthorized: (name: string, version: number) => createErrorData(`Client not authorized ${name}(${version})`),
	},
	contentTypeNotAccepted: (contentType: string) => createErrorData(`ContentType ${contentType} not accepted`),
	validation: (issues: Record<string, any>) => createErrorData("Validation extended-error", issues, 400),
	unauthorized: () => createErrorData("Unauthorized", {}, 401),
	forbidden: () => createErrorData("Forbidden", {}, 403),
	conflict: (details: Record<string, any> = {}) => createErrorData("Conflict", details, 409),
	notFound: (details: Record<string, any> = {}) => createErrorData("Not Found", details, 404),
	error: (details: Record<string, any> = {}) => createErrorData("Some error occurred", details, 500),
};

preprocessErrorTree(cometError, "COMET");