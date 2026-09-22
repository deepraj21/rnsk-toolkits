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

// All API Builder endpoints require the v10 Accept header.
const V10 = { v10: true };

// ---- APIs ----

export const postmanCreateAnApi = tool({
    description:
        'Create a new API in Postman. Use when you need to create an API with a name, summary, and description in your Postman workspace.',
    inputSchema: z.object({
        ...authField,
        workspaceId: z.string().describe('The workspace ID where the API will be created'),
        name: z.string().describe('The name of the API to create'),
        summary: z.string().optional().describe('A brief summary of the API'),
        description: z.string().optional().describe('A detailed description of the API'),
    }),
    execute: async ({ postmanApiKey, workspaceId, name, summary, description }) => {
        try {
            if (!postmanApiKey) return missingKey();
            return await postmanRequest(postmanApiKey, 'POST', '/apis', {
                ...V10,
                query: { workspaceId },
                body: {
                    name,
                    ...(summary !== undefined ? { summary } : {}),
                    ...(description !== undefined ? { description } : {}),
                },
            });
        } catch (error) {
            return toPostmanError(error, 'Failed to create API');
        }
    },
});

export const postmanGetAllApis = tool({
    description:
        'Get all APIs accessible to the authenticated user with optional workspace filtering. Use when you need to list or retrieve APIs from Postman. Returns an array of API objects with their IDs, names, summaries, and other metadata.',
    inputSchema: z.object({
        ...authField,
        workspaceId: z.string().optional().describe('Filter by workspace ID. If not provided, returns all APIs accessible to the user'),
        limit: z.number().int().min(1).optional().describe('Maximum number of APIs to return per page'),
        cursor: z.string().optional().describe('Pagination cursor from a previous response'),
    }),
    execute: async ({ postmanApiKey, workspaceId, limit, cursor }) => {
        try {
            if (!postmanApiKey) return missingKey();
            return await postmanRequest(postmanApiKey, 'GET', '/apis', {
                ...V10,
                query: { workspaceId, limit, cursor },
            });
        } catch (error) {
            return toPostmanError(error, 'Failed to get APIs');
        }
    },
});

export const postmanGetApiInformation = tool({
    description:
        'Retrieve information about a specific API in Postman. Use when you need to fetch API details including name, description, versions, and schemas.',
    inputSchema: z.object({
        ...authField,
        apiId: z.string().describe('The unique identifier of the API to retrieve'),
    }),
    execute: async ({ postmanApiKey, apiId }) => {
        try {
            if (!postmanApiKey) return missingKey();
            return await postmanRequest(postmanApiKey, 'GET', `/apis/${encodeURIComponent(apiId)}`, { ...V10 });
        } catch (error) {
            return toPostmanError(error, 'Failed to get API');
        }
    },
});

export const postmanUpdateAnApi = tool({
    description:
        'Update an existing API in Postman. Use when you need to modify the name, summary, or description of an API.',
    inputSchema: z.object({
        ...authField,
        apiId: z.string().describe('The unique identifier of the API to update'),
        name: z.string().optional().describe('The new name of the API'),
        summary: z.string().optional().describe('A new brief summary of the API'),
        description: z.string().optional().describe('A new detailed description of the API'),
    }),
    execute: async ({ postmanApiKey, apiId, name, summary, description }) => {
        try {
            if (!postmanApiKey) return missingKey();
            return await postmanRequest(postmanApiKey, 'PUT', `/apis/${encodeURIComponent(apiId)}`, {
                ...V10,
                body: {
                    ...(name !== undefined ? { name } : {}),
                    ...(summary !== undefined ? { summary } : {}),
                    ...(description !== undefined ? { description } : {}),
                },
            });
        } catch (error) {
            return toPostmanError(error, 'Failed to update API');
        }
    },
});

export const postmanDeleteAnApi = tool({
    description:
        'Delete an API from Postman. Use when you need to permanently remove an API. On success, returns HTTP 204 No Content.',
    inputSchema: z.object({
        ...authField,
        apiId: z.string().describe('The ID of the API to delete'),
    }),
    execute: async ({ postmanApiKey, apiId }) => {
        try {
            if (!postmanApiKey) return missingKey();
            return await postmanRequest(postmanApiKey, 'DELETE', `/apis/${encodeURIComponent(apiId)}`, { ...V10 });
        } catch (error) {
            return toPostmanError(error, 'Failed to delete API');
        }
    },
});

export const postmanGetAllApiVersions = tool({
    description:
        'Get all published versions of a specific API in Postman. Use when you need to list or retrieve version information for an API. Returns an array of version objects with their IDs and names.',
    inputSchema: z.object({
        ...authField,
        apiId: z.string().describe('The unique identifier of the API whose versions you want to retrieve'),
        limit: z.number().int().min(1).optional().describe('Maximum number of versions to return per page'),
        cursor: z.string().optional().describe('Pagination cursor from a previous response'),
    }),
    execute: async ({ postmanApiKey, apiId, limit, cursor }) => {
        try {
            if (!postmanApiKey) return missingKey();
            return await postmanRequest(postmanApiKey, 'GET', `/apis/${encodeURIComponent(apiId)}/versions`, {
                ...V10,
                query: { limit, cursor },
            });
        } catch (error) {
            return toPostmanError(error, 'Failed to get API versions');
        }
    },
});

export const postmanGetApiVersion = tool({
    description:
        'Get information about a specific API version in Postman. Use when you need to retrieve details about a particular version of an API. Returns version details including ID, name, creation date, and associated schemas.',
    inputSchema: z.object({
        ...authField,
        apiId: z.string().describe('The unique identifier of the API'),
        apiVersionId: z.string().describe('The unique identifier of the API version to retrieve'),
    }),
    execute: async ({ postmanApiKey, apiId, apiVersionId }) => {
        try {
            if (!postmanApiKey) return missingKey();
            return await postmanRequest(
                postmanApiKey,
                'GET',
                `/apis/${encodeURIComponent(apiId)}/versions/${encodeURIComponent(apiVersionId)}`,
                { ...V10 },
            );
        } catch (error) {
            return toPostmanError(error, 'Failed to get API version');
        }
    },
});

// ---- API schemas ----

const schemaFileInput = z
    .object({
        path: z.string().describe("The path of the file in the schema, e.g. 'index.json' or 'openapi.yaml'"),
        content: z.string().describe('The content of the schema file as a JSON or YAML string'),
    })
    .describe('File containing schema content');

export const postmanCreateApiSchema = tool({
    description:
        'Create a schema for an API in Postman. Use when you need to add a schema definition (such as OpenAPI, GraphQL, or Protocol Buffers) to an existing API. The schema can consist of single or multiple files. Returns the created schema ID and metadata.',
    inputSchema: z.object({
        ...authField,
        apiId: z.string().describe('The unique identifier (UUID) of the API for which to create the schema'),
        type: z
            .string()
            .describe("The type of schema, e.g. 'openapi:3', 'openapi:2', 'openapi:3_1', 'graphql', 'proto:2', 'proto:3', 'asyncapi:2'"),
        files: z
            .array(schemaFileInput)
            .min(1)
            .describe('List of files that make up the schema. For single-file schemas provide one file; for multi-file schemas provide all referenced files'),
    }),
    execute: async ({ postmanApiKey, apiId, type, files }) => {
        try {
            if (!postmanApiKey) return missingKey();
            return await postmanRequest(postmanApiKey, 'POST', `/apis/${encodeURIComponent(apiId)}/schemas`, {
                ...V10,
                body: { type, files },
            });
        } catch (error) {
            return toPostmanError(error, 'Failed to create API schema');
        }
    },
});

export const postmanGetApiSchema = tool({
    description:
        'Retrieve information about an API schema from Postman. Use when you need to fetch schema details for a specific API. Optionally specify a version ID to get a schema published in a specific API version.',
    inputSchema: z.object({
        ...authField,
        apiId: z.string().describe('The API unique identifier'),
        schemaId: z.string().describe('The schema unique identifier'),
        versionId: z.string().optional().describe('Optional API version ID to get a schema published in a specific API version'),
    }),
    execute: async ({ postmanApiKey, apiId, schemaId, versionId }) => {
        try {
            if (!postmanApiKey) return missingKey();
            return await postmanRequest(
                postmanApiKey,
                'GET',
                `/apis/${encodeURIComponent(apiId)}/schemas/${encodeURIComponent(schemaId)}`,
                { ...V10, query: { versionId } },
            );
        } catch (error) {
            return toPostmanError(error, 'Failed to get API schema');
        }
    },
});

export const postmanGetSchemaFiles = tool({
    description:
        'Retrieve files in an API schema from Postman. Use when you need to list or view schema files for a specific API and schema ID. Optionally filter by version ID to get files from a particular API version.',
    inputSchema: z.object({
        ...authField,
        apiId: z.string().describe('The unique identifier of the API containing the schema'),
        schemaId: z.string().describe('The unique identifier of the schema whose files you want to retrieve'),
        versionId: z.string().optional().describe('Optional version ID to get schema files published in a specific API version'),
    }),
    execute: async ({ postmanApiKey, apiId, schemaId, versionId }) => {
        try {
            if (!postmanApiKey) return missingKey();
            return await postmanRequest(
                postmanApiKey,
                'GET',
                `/apis/${encodeURIComponent(apiId)}/schemas/${encodeURIComponent(schemaId)}/files`,
                { ...V10, query: { versionId } },
            );
        } catch (error) {
            return toPostmanError(error, 'Failed to get schema files');
        }
    },
});

export const postmanGetSchemaFileContents = tool({
    description:
        'Get the contents of an API schema file at a specified path. Use when you need to retrieve the actual content of a schema file. Optionally specify a version ID to get file contents from a specific API version.',
    inputSchema: z.object({
        ...authField,
        apiId: z.string().describe('The API unique identifier'),
        schemaId: z.string().describe('The schema unique identifier'),
        filePath: z.string().describe("The path of the file within the schema, e.g. 'index.yaml' or 'schemas/openapi.yaml'"),
        versionId: z.string().optional().describe('Optional version ID to get schema file contents published in an API version'),
    }),
    execute: async ({ postmanApiKey, apiId, schemaId, filePath, versionId }) => {
        try {
            if (!postmanApiKey) return missingKey();
            return await postmanRequest(
                postmanApiKey,
                'GET',
                `/apis/${encodeURIComponent(apiId)}/schemas/${encodeURIComponent(schemaId)}/files/${encodeURIComponent(filePath)}`,
                { ...V10, query: { versionId } },
            );
        } catch (error) {
            return toPostmanError(error, 'Failed to get schema file contents');
        }
    },
});

export const postmanCreateOrUpdateASchemaFile = tool({
    description:
        'Create or update an API schema file in Postman. Use when you need to add a new schema file or modify an existing one within an API schema. If the provided file path exists, the file is updated; otherwise a new file is created. If the path contains slashes, folders are created.',
    inputSchema: z.object({
        ...authField,
        apiId: z.string().describe('The unique identifier of the API containing the schema'),
        schemaId: z.string().describe('The unique identifier of the schema the file belongs to'),
        filePath: z.string().describe("The path of the schema file to create or update, e.g. 'index.json' or 'schemas/openapi.yaml'"),
        content: z.string().describe('The stringified JSON/YAML content of the schema file'),
        name: z.string().optional().describe('The schema file name'),
    }),
    execute: async ({ postmanApiKey, apiId, schemaId, filePath, content, name }) => {
        try {
            if (!postmanApiKey) return missingKey();
            return await postmanRequest(
                postmanApiKey,
                'PUT',
                `/apis/${encodeURIComponent(apiId)}/schemas/${encodeURIComponent(schemaId)}/files/${encodeURIComponent(filePath)}`,
                {
                    ...V10,
                    body: { content, ...(name !== undefined ? { name } : {}) },
                },
            );
        } catch (error) {
            return toPostmanError(error, 'Failed to create or update schema file');
        }
    },
});

export const postmanDeleteASchemaFile = tool({
    description:
        'Delete a file in an API schema. Use when you need to remove a specific file from a schema. On success, returns HTTP 204 No Content.',
    inputSchema: z.object({
        ...authField,
        apiId: z.string().describe('The API unique identifier containing the schema'),
        schemaId: z.string().describe('The schema unique identifier containing the file'),
        filePath: z.string().describe('The path of the schema file to delete'),
    }),
    execute: async ({ postmanApiKey, apiId, schemaId, filePath }) => {
        try {
            if (!postmanApiKey) return missingKey();
            return await postmanRequest(
                postmanApiKey,
                'DELETE',
                `/apis/${encodeURIComponent(apiId)}/schemas/${encodeURIComponent(schemaId)}/files/${encodeURIComponent(filePath)}`,
                { ...V10 },
            );
        } catch (error) {
            return toPostmanError(error, 'Failed to delete schema file');
        }
    },
});

export const postmanSyncCollectionWithSchema = tool({
    description:
        'Sync a collection attached to an API with the API schema. This is an asynchronous endpoint that returns HTTP 202 Accepted. Use when you need to synchronize a collection with changes made to the API schema. The collection must already be attached to the API. Returns a task ID that can be used to check the status of the sync operation.',
    inputSchema: z.object({
        ...authField,
        apiId: z.string().describe('The unique identifier of the API in UUID format'),
        collectionUid: z.string().describe('The UID of the collection attached to the API, e.g. userId-collectionId'),
    }),
    execute: async ({ postmanApiKey, apiId, collectionUid }) => {
        try {
            if (!postmanApiKey) return missingKey();
            return await postmanRequest(
                postmanApiKey,
                'PUT',
                `/apis/${encodeURIComponent(apiId)}/collections/${encodeURIComponent(collectionUid)}/sync-with-schema-tasks`,
                { ...V10 },
            );
        } catch (error) {
            return toPostmanError(error, 'Failed to sync collection with schema');
        }
    },
});

// ---- API version relations (legacy relation endpoints) ----

const relationIds = z.array(z.string()).optional().describe('Array of entity UIDs to relate');

export const postmanCreateApiVersionRelations = tool({
    description:
        'Create new relations for an API version. Use when you need to link collections or mock servers to an API version as contract tests, test suites, documentation, or mocks.',
    inputSchema: z.object({
        ...authField,
        apiId: z.string().describe('The unique identifier of the API'),
        apiVersionId: z.string().describe('The unique identifier of the API version'),
        contracttest: z.array(z.string()).optional().describe('Array of collection UIDs for contract testing'),
        testsuite: z.array(z.string()).optional().describe('Array of collection UIDs for test suites'),
        documentation: z.array(z.string()).optional().describe('Array of collection UIDs for documentation'),
        mock: relationIds,
    }),
    execute: async ({ postmanApiKey, apiId, apiVersionId, contracttest, testsuite, documentation, mock }) => {
        try {
            if (!postmanApiKey) return missingKey();
            return await postmanRequest(
                postmanApiKey,
                'POST',
                `/apis/${encodeURIComponent(apiId)}/versions/${encodeURIComponent(apiVersionId)}/relations`,
                {
                    body: {
                        ...(contracttest !== undefined ? { contracttest } : {}),
                        ...(testsuite !== undefined ? { testsuite } : {}),
                        ...(documentation !== undefined ? { documentation } : {}),
                        ...(mock !== undefined ? { mock } : {}),
                    },
                },
            );
        } catch (error) {
            return toPostmanError(error, 'Failed to create API version relations');
        }
    },
});

export const postmanGetAllLinkedRelations = tool({
    description:
        'Retrieve all linked relations for a specific API version in Postman. Use when you need to discover what collections, documentation, mocks, or monitors are linked to an API version.',
    inputSchema: z.object({
        ...authField,
        apiId: z.string().describe('The unique identifier of the API'),
        apiVersionId: z.string().describe('The unique identifier of the API version'),
    }),
    execute: async ({ postmanApiKey, apiId, apiVersionId }) => {
        try {
            if (!postmanApiKey) return missingKey();
            return await postmanRequest(
                postmanApiKey,
                'GET',
                `/apis/${encodeURIComponent(apiId)}/versions/${encodeURIComponent(apiVersionId)}/relations`,
            );
        } catch (error) {
            return toPostmanError(error, 'Failed to get linked relations');
        }
    },
});

export const postmanGetUnclassifiedRelations = tool({
    description:
        'Get unclassified relations for an API version in Postman. Use when you need to retrieve unclassified relations for a specific API version. This endpoint is for Postman v10 and higher.',
    inputSchema: z.object({
        ...authField,
        apiId: z.string().describe('The API identifier (UUID format)'),
        apiVersionId: z.string().describe('The API version identifier (UUID format)'),
    }),
    execute: async ({ postmanApiKey, apiId, apiVersionId }) => {
        try {
            if (!postmanApiKey) return missingKey();
            return await postmanRequest(
                postmanApiKey,
                'GET',
                `/apis/${encodeURIComponent(apiId)}/versions/${encodeURIComponent(apiVersionId)}/relations/unclassified`,
            );
        } catch (error) {
            return toPostmanError(error, 'Failed to get unclassified relations');
        }
    },
});
