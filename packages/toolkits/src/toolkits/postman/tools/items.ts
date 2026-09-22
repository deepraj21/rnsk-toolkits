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

const headerItem = z.record(z.any()).describe('Header object, e.g. {"key": "Content-Type", "value": "application/json"}');

export const postmanCreateAFolder = tool({
    description:
        'Create a folder in a Postman collection. Use when you need to organize requests by creating a new folder within a collection. For complete details, see the Postman Collection Format documentation.',
    inputSchema: z.object({
        ...authField,
        collectionId: z.string().describe('The unique identifier of the collection to create the folder in'),
        name: z.string().describe('The name of the folder to create'),
        description: z.string().optional().describe('Optional description of the folder explaining its purpose'),
        folderId: z.string().optional().describe('Optional parent folder UID to nest the new folder inside'),
    }),
    execute: async ({ postmanApiKey, collectionId, name, description, folderId }) => {
        try {
            if (!postmanApiKey) return missingKey();
            return await postmanRequest(postmanApiKey, 'POST', `/collections/${encodeURIComponent(collectionId)}/folders`, {
                body: {
                    name,
                    ...(description !== undefined ? { description } : {}),
                    ...(folderId !== undefined ? { folder: folderId } : {}),
                },
            });
        } catch (error) {
            return toPostmanError(error, 'Failed to create folder');
        }
    },
});

export const postmanGetFolderInformation = tool({
    description:
        'Retrieve information about a folder in a Postman collection. Use when you need to fetch details about a specific folder including its name, description, owner, and timestamps.',
    inputSchema: z.object({
        ...authField,
        collectionId: z.string().describe('The unique identifier of the collection containing the folder'),
        folderId: z.string().describe('The unique identifier of the folder to retrieve. Folder IDs should not contain spaces to avoid 404 errors'),
    }),
    execute: async ({ postmanApiKey, collectionId, folderId }) => {
        try {
            if (!postmanApiKey) return missingKey();
            return await postmanRequest(
                postmanApiKey,
                'GET',
                `/collections/${encodeURIComponent(collectionId)}/folders/${encodeURIComponent(folderId)}`,
            );
        } catch (error) {
            return toPostmanError(error, 'Failed to get folder');
        }
    },
});

export const postmanUpdateAFolder = tool({
    description:
        'Update a folder in a Postman collection. Use when you need to modify the name or description of an existing folder. For complete properties and information, see the Postman Collection Format documentation.',
    inputSchema: z.object({
        ...authField,
        collectionId: z.string().describe('The unique identifier of the collection containing the folder'),
        folderId: z.string().describe('The unique identifier of the folder to update'),
        name: z.string().optional().describe('The new name for the folder'),
        description: z.string().optional().describe('Optional updated description for the folder explaining its purpose'),
    }),
    execute: async ({ postmanApiKey, collectionId, folderId, name, description }) => {
        try {
            if (!postmanApiKey) return missingKey();
            return await postmanRequest(
                postmanApiKey,
                'PUT',
                `/collections/${encodeURIComponent(collectionId)}/folders/${encodeURIComponent(folderId)}`,
                {
                    body: {
                        ...(name !== undefined ? { name } : {}),
                        ...(description !== undefined ? { description } : {}),
                    },
                },
            );
        } catch (error) {
            return toPostmanError(error, 'Failed to update folder');
        }
    },
});

export const postmanDeleteAFolder = tool({
    description:
        'Delete a folder in a Postman collection. Use when you need to remove a folder and all its contents from a collection. The folder ID should not contain spaces to avoid 404 errors.',
    inputSchema: z.object({
        ...authField,
        collectionId: z.string().describe('The unique identifier of the collection containing the folder to delete'),
        folderId: z.string().describe('The unique identifier of the folder to delete'),
    }),
    execute: async ({ postmanApiKey, collectionId, folderId }) => {
        try {
            if (!postmanApiKey) return missingKey();
            return await postmanRequest(
                postmanApiKey,
                'DELETE',
                `/collections/${encodeURIComponent(collectionId)}/folders/${encodeURIComponent(folderId)}`,
            );
        } catch (error) {
            return toPostmanError(error, 'Failed to delete folder');
        }
    },
});

const requestFields = {
    name: z.string().describe('The name of the request'),
    description: z.string().optional().describe('Description of the request'),
    method: z.string().optional().describe("HTTP method for the request, e.g. 'GET', 'POST', 'PUT', 'DELETE', 'PATCH'"),
    url: z.string().optional().describe('The request URL'),
    headers: z.array(headerItem).optional().describe('Array of header objects with key and value properties'),
    queryParams: z.array(z.record(z.any())).optional().describe('Array of query parameter objects'),
    dataMode: z.enum(['raw', 'urlencoded', 'formdata', 'binary', 'graphql']).optional().describe("The mode of the request body"),
    rawBody: z.string().optional().describe("The raw body content when dataMode is 'raw'"),
    requestExtras: z
        .record(z.any())
        .optional()
        .describe('Advanced request fields merged into the request body (auth, events, data, dataOptions, graphqlModeData, etc.)'),
};

function buildRequestBody(args: {
    name?: string;
    description?: string;
    method?: string;
    url?: string;
    headers?: Array<Record<string, unknown>>;
    queryParams?: Array<Record<string, unknown>>;
    dataMode?: string;
    rawBody?: string;
    requestExtras?: Record<string, unknown>;
}) {
    const { name, description, method, url, headers, queryParams, dataMode, rawBody, requestExtras, ...rest } = args as any;
    return {
        ...(requestExtras ?? {}),
        ...(name !== undefined ? { name } : {}),
        ...(description !== undefined ? { description } : {}),
        ...(method !== undefined ? { method } : {}),
        ...(url !== undefined ? { url } : {}),
        ...(headers !== undefined ? { headerData: headers } : {}),
        ...(queryParams !== undefined ? { queryParams } : {}),
        ...(dataMode !== undefined ? { dataMode } : {}),
        ...(rawBody !== undefined ? { rawModeData: rawBody } : {}),
        ...rest,
    };
}

export const postmanCreateRequestInCollection = tool({
    description:
        'Create a new request in a Postman collection. Use when you need to add a request to an existing collection with specified method, URL, headers, and body.',
    inputSchema: z.object({
        ...authField,
        collectionId: z.string().describe('The unique identifier of the collection where the request will be created'),
        folderId: z.string().optional().describe('Optional folder UID to create the request inside'),
        ...requestFields,
    }),
    execute: async ({ postmanApiKey, collectionId, folderId, ...fields }) => {
        try {
            if (!postmanApiKey) return missingKey();
            return await postmanRequest(postmanApiKey, 'POST', `/collections/${encodeURIComponent(collectionId)}/requests`, {
                query: { folder: folderId },
                body: buildRequestBody(fields),
            });
        } catch (error) {
            return toPostmanError(error, 'Failed to create request');
        }
    },
});

export const postmanGetRequestInformation = tool({
    description:
        'Retrieve information about a specific request in a Postman collection. Use when you need to fetch details about a request including its method, URL, headers, body, authentication, and associated scripts.',
    inputSchema: z.object({
        ...authField,
        collectionId: z.string().describe('The unique identifier of the collection containing the request'),
        requestId: z.string().describe('The unique identifier of the request to retrieve'),
    }),
    execute: async ({ postmanApiKey, collectionId, requestId }) => {
        try {
            if (!postmanApiKey) return missingKey();
            return await postmanRequest(
                postmanApiKey,
                'GET',
                `/collections/${encodeURIComponent(collectionId)}/requests/${encodeURIComponent(requestId)}`,
            );
        } catch (error) {
            return toPostmanError(error, 'Failed to get request');
        }
    },
});

export const postmanUpdateRequestInCollection = tool({
    description:
        "Update a request in a Postman collection. Use when you need to modify an existing request's name, method, URL, headers, or body following the Postman Collection Format.",
    inputSchema: z.object({
        ...authField,
        collectionId: z.string().describe('The unique identifier of the collection containing the request'),
        requestId: z.string().describe('The unique identifier of the request to update'),
        ...requestFields,
    }),
    execute: async ({ postmanApiKey, collectionId, requestId, ...fields }) => {
        try {
            if (!postmanApiKey) return missingKey();
            return await postmanRequest(
                postmanApiKey,
                'PUT',
                `/collections/${encodeURIComponent(collectionId)}/requests/${encodeURIComponent(requestId)}`,
                { body: buildRequestBody(fields) },
            );
        } catch (error) {
            return toPostmanError(error, 'Failed to update request');
        }
    },
});

const responseFields = {
    name: z.string().describe('The name of the response example'),
    statusCode: z.number().int().optional().describe('The HTTP status code, e.g. 200, 404, 500'),
    statusText: z.string().optional().describe("The status text, e.g. 'OK', 'Not Found', 'Bad Request'"),
    headers: z.array(headerItem).optional().describe('Array of header objects with key and value properties'),
    bodyText: z.string().optional().describe('The response body as a string'),
    responseExtras: z
        .record(z.any())
        .optional()
        .describe('Advanced response fields merged into the request body (cookies, language, dataMode, originalRequest, etc.)'),
};

function buildResponseBody(args: {
    name?: string;
    statusCode?: number;
    statusText?: string;
    headers?: Array<Record<string, unknown>>;
    bodyText?: string;
    responseExtras?: Record<string, unknown>;
}) {
    const { name, statusCode, statusText, headers, bodyText, responseExtras } = args;
    return {
        ...(responseExtras ?? {}),
        ...(name !== undefined ? { name } : {}),
        ...(statusCode !== undefined ? { responseCode: { code: statusCode } } : {}),
        ...(statusText !== undefined ? { status: statusText } : {}),
        ...(headers !== undefined ? { headers } : {}),
        ...(bodyText !== undefined ? { text: bodyText } : {}),
    };
}

export const postmanCreateAResponse = tool({
    description:
        'Create a request response in a Postman collection. Use when you need to add a saved response example to a specific request in a collection.',
    inputSchema: z.object({
        ...authField,
        collectionId: z.string().describe('The unique identifier of the collection where the response will be created'),
        parentRequestId: z.string().describe('The unique identifier of the parent request to which this response will be attached'),
        ...responseFields,
    }),
    execute: async ({ postmanApiKey, collectionId, parentRequestId, ...fields }) => {
        try {
            if (!postmanApiKey) return missingKey();
            return await postmanRequest(postmanApiKey, 'POST', `/collections/${encodeURIComponent(collectionId)}/responses`, {
                query: { request: parentRequestId },
                body: buildResponseBody(fields),
            });
        } catch (error) {
            return toPostmanError(error, 'Failed to create response');
        }
    },
});

export const postmanGetResponseInformation = tool({
    description:
        'Retrieve information about a saved response in a Postman collection. Use when you need to fetch details about a specific response including status, headers, body, and metadata.',
    inputSchema: z.object({
        ...authField,
        collectionId: z.string().describe('The unique identifier of the collection containing the response'),
        responseId: z.string().describe('The unique identifier of the response to retrieve'),
    }),
    execute: async ({ postmanApiKey, collectionId, responseId }) => {
        try {
            if (!postmanApiKey) return missingKey();
            return await postmanRequest(
                postmanApiKey,
                'GET',
                `/collections/${encodeURIComponent(collectionId)}/responses/${encodeURIComponent(responseId)}`,
            );
        } catch (error) {
            return toPostmanError(error, 'Failed to get response');
        }
    },
});

export const postmanUpdateAResponse = tool({
    description:
        'Update a response in a Postman collection. Use when you need to modify properties of an existing saved response example such as name, status, code, headers, cookies, or body.',
    inputSchema: z.object({
        ...authField,
        collectionId: z.string().describe('The unique identifier of the collection containing the response'),
        responseId: z.string().describe('The unique identifier of the response to update'),
        ...responseFields,
    }),
    execute: async ({ postmanApiKey, collectionId, responseId, ...fields }) => {
        try {
            if (!postmanApiKey) return missingKey();
            return await postmanRequest(
                postmanApiKey,
                'PUT',
                `/collections/${encodeURIComponent(collectionId)}/responses/${encodeURIComponent(responseId)}`,
                { body: buildResponseBody(fields) },
            );
        } catch (error) {
            return toPostmanError(error, 'Failed to update response');
        }
    },
});

export const postmanDeleteAResponse = tool({
    description:
        'Delete a response in a Postman collection. Use when you need to remove a saved response from a collection.',
    inputSchema: z.object({
        ...authField,
        collectionId: z.string().describe('The unique identifier of the collection containing the response'),
        responseId: z.string().describe('The unique identifier of the response to delete'),
    }),
    execute: async ({ postmanApiKey, collectionId, responseId }) => {
        try {
            if (!postmanApiKey) return missingKey();
            return await postmanRequest(
                postmanApiKey,
                'DELETE',
                `/collections/${encodeURIComponent(collectionId)}/responses/${encodeURIComponent(responseId)}`,
            );
        } catch (error) {
            return toPostmanError(error, 'Failed to delete response');
        }
    },
});
