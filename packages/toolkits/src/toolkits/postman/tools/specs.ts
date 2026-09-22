// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { postmanRequest, toPostmanError } from './client.js';

const authField = {
    postmanApiKey: z.string().optional().describe('Injected by system; do not provide'),
};

function missingKey() {
    return { error: 'Postman API key is required. Connect Postman first.' };
}

const specType = z
    .enum(['OPENAPI:2.0', 'OPENAPI:3.0', 'OPENAPI:3.1', 'ASYNCAPI:2.0', 'ASYNCAPI:3.0', 'PROTOBUF:2', 'PROTOBUF:3', 'GRAPHQL', 'SMITHY:2.0'])
    .describe('The type of specification');

const specFileInput = z
    .object({
        path: z.string().describe("The file path within the specification, e.g. 'index.yaml' or 'paths/users.yaml'"),
        content: z.string().describe('The content of the file as a YAML or JSON string'),
    })
    .describe('File in the API specification');

export const postmanCreateASpec = tool({
    description:
        "Create an API specification in Postman's Spec Hub. Use when you need to create single or multi-file specifications in a workspace. Supports various spec types including OpenAPI 3.0, OpenAPI 3.1, and AsyncAPI 2.0.",
    inputSchema: z.object({
        ...authField,
        workspaceId: z.string().describe('The workspace ID where the spec will be created'),
        name: z.string().describe('The name of the API specification to create'),
        type: specType,
        files: z
            .array(specFileInput)
            .min(1)
            .describe('Array of files for the specification. For single-file specs provide one file; for multi-file specs provide multiple files'),
    }),
    execute: async ({ postmanApiKey, workspaceId, name, type, files }) => {
        try {
            if (!postmanApiKey) return missingKey();
            return await postmanRequest(postmanApiKey, 'POST', '/specs', {
                query: { workspaceId },
                body: { name, type, files },
            });
        } catch (error) {
            return toPostmanError(error, 'Failed to create spec');
        }
    },
});

export const postmanGetAllApiSpecifications = tool({
    description:
        'Get all API specifications in a workspace. Use when you need to list or retrieve API specs from a specific Postman workspace. Returns an array of spec objects with their IDs, names, types, and timestamps, along with pagination metadata.',
    inputSchema: z.object({
        ...authField,
        workspaceId: z.string().describe('The workspace ID to fetch API specifications from'),
        limit: z.number().int().min(1).optional().describe('Maximum number of specs to return per page'),
        cursor: z.string().optional().describe('Pagination cursor from a previous response'),
    }),
    execute: async ({ postmanApiKey, workspaceId, limit, cursor }) => {
        try {
            if (!postmanApiKey) return missingKey();
            return await postmanRequest(postmanApiKey, 'GET', '/specs', {
                query: { workspaceId, limit, cursor },
            });
        } catch (error) {
            return toPostmanError(error, 'Failed to get specs');
        }
    },
});

export const postmanGetApiSpecification = tool({
    description:
        'Retrieve information about an API specification in Postman. Use when you need to fetch spec details including name, type, and timestamps.',
    inputSchema: z.object({
        ...authField,
        specId: z.string().describe('The unique identifier (UUID) of the API specification to retrieve'),
    }),
    execute: async ({ postmanApiKey, specId }) => {
        try {
            if (!postmanApiKey) return missingKey();
            return await postmanRequest(postmanApiKey, 'GET', `/specs/${encodeURIComponent(specId)}`);
        } catch (error) {
            return toPostmanError(error, 'Failed to get spec');
        }
    },
});

export const postmanDeleteASpec = tool({
    description:
        'Delete an API specification from Postman. Use when you need to permanently remove a specification. On success, returns HTTP 204 No Content.',
    inputSchema: z.object({
        ...authField,
        specId: z.string().describe('The ID of the API specification to delete'),
    }),
    execute: async ({ postmanApiKey, specId }) => {
        try {
            if (!postmanApiKey) return missingKey();
            return await postmanRequest(postmanApiKey, 'DELETE', `/specs/${encodeURIComponent(specId)}`);
        } catch (error) {
            return toPostmanError(error, 'Failed to delete spec');
        }
    },
});

export const postmanUpdateSpecProperties = tool({
    description:
        "Update an API specification's properties such as its name. Use when you need to modify metadata of an existing spec.",
    inputSchema: z.object({
        ...authField,
        specId: z.string().describe('The unique identifier (UUID) of the API specification to update'),
        name: z.string().optional().describe('The new name for the API specification'),
    }),
    execute: async ({ postmanApiKey, specId, name }) => {
        try {
            if (!postmanApiKey) return missingKey();
            return await postmanRequest(postmanApiKey, 'PATCH', `/specs/${encodeURIComponent(specId)}`, {
                body: { ...(name !== undefined ? { name } : {}) },
            });
        } catch (error) {
            return toPostmanError(error, 'Failed to update spec properties');
        }
    },
});

export const postmanCreateSpecFile = tool({
    description:
        'Create a new file in an API specification. Use when you need to add a new file (such as schema definitions, path configurations, or components) to an existing spec.',
    inputSchema: z.object({
        ...authField,
        specId: z.string().describe('The unique identifier of the API specification in which to create the file'),
        path: z.string().describe("The file path within the spec, e.g. 'components/schemas.yaml' or 'openapi.yaml'"),
        content: z.string().describe('The content of the file to create as a valid YAML or JSON string'),
    }),
    execute: async ({ postmanApiKey, specId, path, content }) => {
        try {
            if (!postmanApiKey) return missingKey();
            return await postmanRequest(postmanApiKey, 'POST', `/specs/${encodeURIComponent(specId)}/files`, {
                body: { path, content },
            });
        } catch (error) {
            return toPostmanError(error, 'Failed to create spec file');
        }
    },
});

export const postmanGetSpecFileContents = tool({
    description:
        "Get the contents of an API specification's file. Use when you need to retrieve the actual content and metadata of a specific file within a spec.",
    inputSchema: z.object({
        ...authField,
        specId: z.string().describe('The ID of the API specification'),
        filePath: z.string().describe("The path of the file within the spec, e.g. 'openapi.yaml' or 'components/schemas.yaml'"),
    }),
    execute: async ({ postmanApiKey, specId, filePath }) => {
        try {
            if (!postmanApiKey) return missingKey();
            return await postmanRequest(
                postmanApiKey,
                'GET',
                `/specs/${encodeURIComponent(specId)}/files/${encodeURIComponent(filePath)}`,
            );
        } catch (error) {
            return toPostmanError(error, 'Failed to get spec file');
        }
    },
});

export const postmanUpdateSpecFile = tool({
    description:
        "Update an API specification file's content. Use when you need to modify the contents of a specific file within a spec.",
    inputSchema: z.object({
        ...authField,
        specId: z.string().describe('The unique identifier of the API specification'),
        filePath: z.string().describe("The path of the file within the spec to update, e.g. 'openapi.yaml'"),
        content: z.string().describe('The updated content of the spec file in YAML or JSON format'),
    }),
    execute: async ({ postmanApiKey, specId, filePath, content }) => {
        try {
            if (!postmanApiKey) return missingKey();
            return await postmanRequest(
                postmanApiKey,
                'PATCH',
                `/specs/${encodeURIComponent(specId)}/files/${encodeURIComponent(filePath)}`,
                { body: { content } },
            );
        } catch (error) {
            return toPostmanError(error, 'Failed to update spec file');
        }
    },
});

export const postmanDeleteSpecFile = tool({
    description:
        'Delete a file from an API specification. Use when you need to remove a specific file from a multi-file specification.',
    inputSchema: z.object({
        ...authField,
        specId: z.string().describe('The unique identifier of the API specification containing the file to delete'),
        filePath: z.string().describe("The path of the file within the specification to delete, e.g. 'components/schemas.yaml'"),
    }),
    execute: async ({ postmanApiKey, specId, filePath }) => {
        try {
            if (!postmanApiKey) return missingKey();
            return await postmanRequest(
                postmanApiKey,
                'DELETE',
                `/specs/${encodeURIComponent(specId)}/files/${encodeURIComponent(filePath)}`,
            );
        } catch (error) {
            return toPostmanError(error, 'Failed to delete spec file');
        }
    },
});

export const postmanGetSpecificationFiles = tool({
    description:
        'Retrieve all files in an API specification from Postman. Use when you need to list or view specification files for a specific spec ID. Returns file metadata including IDs, names, paths, types, and timestamps.',
    inputSchema: z.object({
        ...authField,
        specId: z.string().describe('The ID of the API specification whose files you want to retrieve'),
    }),
    execute: async ({ postmanApiKey, specId }) => {
        try {
            if (!postmanApiKey) return missingKey();
            return await postmanRequest(postmanApiKey, 'GET', `/specs/${encodeURIComponent(specId)}/files`);
        } catch (error) {
            return toPostmanError(error, 'Failed to get spec files');
        }
    },
});

export const postmanGetSpecDefinition = tool({
    description:
        "Get the complete contents of an API specification's definition. Use when you need to retrieve the full OpenAPI/Swagger specification content for a spec. Returns the raw definition content as a string.",
    inputSchema: z.object({
        ...authField,
        specId: z.string().describe('The unique identifier (UUID) of the API specification to retrieve the definition for'),
    }),
    execute: async ({ postmanApiKey, specId }) => {
        try {
            if (!postmanApiKey) return missingKey();
            return await postmanRequest(postmanApiKey, 'GET', `/specs/${encodeURIComponent(specId)}/definitions`);
        } catch (error) {
            return toPostmanError(error, 'Failed to get spec definition');
        }
    },
});

export const postmanGetSpecsGeneratedCollections = tool({
    description:
        "Retrieve all collections generated from an API specification in Postman. Use when you need to fetch collections that have been auto-generated from a spec. Returns metadata and an array of generated collections.",
    inputSchema: z.object({
        ...authField,
        specId: z.string().describe('The unique identifier of the API specification'),
        limit: z.number().int().min(1).optional().describe('Maximum number of collections to return per page'),
        cursor: z.string().optional().describe('Pagination cursor from a previous response'),
    }),
    execute: async ({ postmanApiKey, specId, limit, cursor }) => {
        try {
            if (!postmanApiKey) return missingKey();
            return await postmanRequest(postmanApiKey, 'GET', `/specs/${encodeURIComponent(specId)}/generations/collection`, {
                query: { limit, cursor },
            });
        } catch (error) {
            return toPostmanError(error, 'Failed to get generated collections');
        }
    },
});

export const postmanGenerateCollectionFromSpec = tool({
    description:
        'Generate a Postman collection from an OpenAPI 2.0, 3.0, or 3.1 specification. Use when you need to create a collection from an existing API spec. The operation is asynchronous and returns a task ID and polling URL to check the generation status.',
    inputSchema: z.object({
        ...authField,
        specId: z.string().describe('The unique identifier of the API specification from which to generate the collection'),
        name: z.string().describe('The name for the generated collection'),
        folderStrategy: z.enum(['Paths', 'Tags']).optional().describe("How folders are organized: 'Paths' organizes by API paths, 'Tags' by OpenAPI tags"),
        requestNameSource: z.enum(['Fallback', 'URL']).optional().describe("Source for request names: 'Fallback' uses operationId/summary/URL, 'URL' uses the endpoint URL"),
    }),
    execute: async ({ postmanApiKey, specId, name, folderStrategy, requestNameSource }) => {
        try {
            if (!postmanApiKey) return missingKey();
            const options: Record<string, unknown> = {};
            if (folderStrategy !== undefined) options.folderStrategy = folderStrategy;
            if (requestNameSource !== undefined) options.requestNameSource = requestNameSource;
            return await postmanRequest(postmanApiKey, 'POST', `/specs/${encodeURIComponent(specId)}/generations/collection`, {
                body: { name, ...(Object.keys(options).length > 0 ? { options } : {}) },
            });
        } catch (error) {
            return toPostmanError(error, 'Failed to generate collection from spec');
        }
    },
});

export const postmanGenerateSpecFromCollection = tool({
    description:
        'Generate an API specification from a Postman collection. Use when you need to create an OpenAPI 3.0 specification from an existing collection. The operation is asynchronous and returns a task ID and polling URL to check the generation status.',
    inputSchema: z.object({
        ...authField,
        collectionUid: z.string().describe('The UID of the collection to generate the specification from'),
        name: z.string().describe('The name for the generated API specification'),
        type: z.enum(['OPENAPI:2.0', 'OPENAPI:3.0', 'OPENAPI:3.1']).describe('The specification type to generate'),
        format: z.string().describe("The format of the generated specification file: 'JSON' or 'YAML'"),
    }),
    execute: async ({ postmanApiKey, collectionUid, name, type, format }) => {
        try {
            if (!postmanApiKey) return missingKey();
            return await postmanRequest(postmanApiKey, 'POST', `/collections/${encodeURIComponent(collectionUid)}/generations/spec`, {
                body: { name, type, format },
            });
        } catch (error) {
            return toPostmanError(error, 'Failed to generate spec from collection');
        }
    },
});

export const postmanGetGeneratedSpec = tool({
    description:
        'Retrieve the API specification generated for a Postman collection. Use when you need to fetch OpenAPI/Swagger specs that have been auto-generated from a collection. Returns metadata and an array of generated specifications.',
    inputSchema: z.object({
        ...authField,
        collectionUid: z.string().describe('The UID of the collection (with team/user prefix) to get generated specifications for'),
    }),
    execute: async ({ postmanApiKey, collectionUid }) => {
        try {
            if (!postmanApiKey) return missingKey();
            return await postmanRequest(postmanApiKey, 'GET', `/collections/${encodeURIComponent(collectionUid)}/generations/spec`);
        } catch (error) {
            return toPostmanError(error, 'Failed to get generated spec');
        }
    },
});

export const postmanSyncCollectionWithSpec = tool({
    description:
        'Sync a collection generated from an API specification. This is an asynchronous operation that returns HTTP 202 Accepted. Use when you need to update a collection to match the latest version of its source API specification. The collection must have been generated from a spec.',
    inputSchema: z.object({
        ...authField,
        collectionUid: z.string().describe('The UID of a collection generated from an API specification to synchronize'),
        specId: z.string().describe('The ID of the source API specification to sync with'),
    }),
    execute: async ({ postmanApiKey, collectionUid, specId }) => {
        try {
            if (!postmanApiKey) return missingKey();
            return await postmanRequest(postmanApiKey, 'PUT', `/collections/${encodeURIComponent(collectionUid)}/synchronizations`, {
                query: { specId },
            });
        } catch (error) {
            return toPostmanError(error, 'Failed to sync collection with spec');
        }
    },
});

export const postmanSyncSpecWithCollection = tool({
    description:
        'Sync an API specification with a linked collection. This is an asynchronous operation that returns HTTP 202 Accepted with task tracking information. Use when you need to synchronize changes from a spec to its generated collection. Prerequisites: the collection must be generated from the spec, and the spec must be single-file.',
    inputSchema: z.object({
        ...authField,
        specId: z.string().describe('The UUID of the API specification to sync'),
        collectionUid: z.string().describe('The UID of the collection generated from this spec to sync with'),
    }),
    execute: async ({ postmanApiKey, specId, collectionUid }) => {
        try {
            if (!postmanApiKey) return missingKey();
            return await postmanRequest(postmanApiKey, 'PUT', `/specs/${encodeURIComponent(specId)}/synchronizations`, {
                query: { collectionUid },
            });
        } catch (error) {
            return toPostmanError(error, 'Failed to sync spec with collection');
        }
    },
});

export const postmanImportOpenApiSpecification = tool({
    description:
        'Import an OpenAPI specification into Postman as a new collection. Use when you need to convert an OpenAPI 3.0+ specification into a Postman collection within a specific workspace. The imported specification is automatically converted to a Postman collection with all endpoints, request parameters, and documentation.',
    inputSchema: z.object({
        ...authField,
        workspaceId: z.string().describe('The workspace ID where the OpenAPI specification will be imported as a collection'),
        type: z.string().describe("The type of import input. Use 'string' when providing the specification as a JSON/YAML string, or 'file' when uploading a file"),
        input: z.string().describe("The OpenAPI specification content as a JSON or YAML string. Must be a valid OpenAPI 3.0+ specification with 'openapi', 'info', and 'paths'"),
    }),
    execute: async ({ postmanApiKey, workspaceId, type, input }) => {
        try {
            if (!postmanApiKey) return missingKey();
            return await postmanRequest(postmanApiKey, 'POST', '/import/openapi', {
                query: { workspace: workspaceId },
                body: { type, input },
            });
        } catch (error) {
            return toPostmanError(error, 'Failed to import OpenAPI specification');
        }
    },
});
