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

// ---- Mock servers ----

export const postmanCreateAMockServer = tool({
    description:
        "Create a new mock server in a Postman collection. Use when you need to create a mock server to simulate API endpoints for testing or development. Returns the created mock server's details including the mockUrl which can be used to make requests.",
    inputSchema: z.object({
        ...authField,
        workspaceId: z.string().optional().describe('The workspace ID where the mock server should be created'),
        name: z.string().optional().describe('The name for the mock server'),
        collectionId: z.string().describe('The collection UID (userId-collectionId format) to create the mock server from'),
        environmentId: z.string().optional().describe('The environment UID to use with the mock server'),
        isPrivate: z.boolean().optional().describe('Whether to create a private mock server. Private mocks require API key authentication. Default is false (public)'),
    }),
    execute: async ({ postmanApiKey, workspaceId, name, collectionId, environmentId, isPrivate }) => {
        try {
            if (!postmanApiKey) return missingKey();
            return await postmanRequest(postmanApiKey, 'POST', '/mocks', {
                query: { workspace: workspaceId },
                body: {
                    mock: {
                        collection: collectionId,
                        ...(name !== undefined ? { name } : {}),
                        ...(environmentId !== undefined ? { environment: environmentId } : {}),
                        ...(isPrivate !== undefined ? { private: isPrivate } : {}),
                    },
                },
            });
        } catch (error) {
            return toPostmanError(error, 'Failed to create mock server');
        }
    },
});

export const postmanGetAllMockServers = tool({
    description:
        'Get all active mock servers accessible to the authenticated user. Use when you need to list or retrieve mock servers from Postman. By default, returns only mock servers you created across all workspaces. Can be filtered by workspace ID.',
    inputSchema: z.object({
        ...authField,
        workspaceId: z.string().optional().describe('Filter by workspace ID. If not provided, returns all mock servers you created across all workspaces'),
        limit: z.number().int().min(1).optional().describe('Maximum number of mock servers to return per page'),
        cursor: z.string().optional().describe('Pagination cursor from a previous response'),
    }),
    execute: async ({ postmanApiKey, workspaceId, limit, cursor }) => {
        try {
            if (!postmanApiKey) return missingKey();
            return await postmanRequest(postmanApiKey, 'GET', '/mocks', {
                query: { workspace: workspaceId, limit, cursor },
            });
        } catch (error) {
            return toPostmanError(error, 'Failed to get mock servers');
        }
    },
});

export const postmanUpdateAMockServer = tool({
    description:
        "Update an existing mock server. Use when you need to change a mock server's name, description, collection, environment, or privacy settings.",
    inputSchema: z.object({
        ...authField,
        mockId: z.string().describe('The unique identifier of the mock server to update'),
        name: z.string().optional().describe('The new name for the mock server'),
        description: z.string().optional().describe('The new description for the mock server'),
        collectionId: z.string().optional().describe('The collection UID to associate with the mock server'),
        environmentId: z.string().optional().describe('The environment UID to use with the mock server'),
        isPrivate: z.boolean().optional().describe('Whether the mock server should be private. Private mocks require API key authentication'),
        versionTag: z.string().optional().describe("The API's version tag ID"),
        serverResponseId: z.string().optional().describe('A server response ID to set as the default response for each request'),
    }),
    execute: async ({ postmanApiKey, mockId, name, description, collectionId, environmentId, isPrivate, versionTag, serverResponseId }) => {
        try {
            if (!postmanApiKey) return missingKey();
            return await postmanRequest(postmanApiKey, 'PUT', `/mocks/${encodeURIComponent(mockId)}`, {
                body: {
                    mock: {
                        ...(name !== undefined ? { name } : {}),
                        ...(description !== undefined ? { description } : {}),
                        ...(collectionId !== undefined ? { collection: collectionId } : {}),
                        ...(environmentId !== undefined ? { environment: environmentId } : {}),
                        ...(isPrivate !== undefined ? { private: isPrivate } : {}),
                        ...(versionTag !== undefined ? { versionTag } : {}),
                        ...(serverResponseId !== undefined ? { config: { serverResponseId } } : {}),
                    },
                },
            });
        } catch (error) {
            return toPostmanError(error, 'Failed to update mock server');
        }
    },
});

export const postmanPublishAMockServer = tool({
    description:
        "Publish a mock server in Postman. Use when you need to make a mock server publicly accessible. Publishing sets the mock server's Access Control configuration to public.",
    inputSchema: z.object({
        ...authField,
        mockId: z.string().describe('The unique identifier of the mock server to publish'),
    }),
    execute: async ({ postmanApiKey, mockId }) => {
        try {
            if (!postmanApiKey) return missingKey();
            return await postmanRequest(postmanApiKey, 'POST', `/mocks/${encodeURIComponent(mockId)}/publish`);
        } catch (error) {
            return toPostmanError(error, 'Failed to publish mock server');
        }
    },
});

const serverResponseFields = {
    name: z.string().describe('Name of the server response'),
    statusCode: z.number().int().optional().describe('HTTP status code for the server response, e.g. 200, 404, 500, 503'),
    headers: z.array(z.record(z.any())).optional().describe('Array of header objects with key and value properties'),
    language: z.string().optional().describe("Preview language for the response body, e.g. 'json', 'html', 'text', 'xml'"),
    body: z.string().optional().describe('The response body content as a string'),
};

export const postmanCreateMockServerResponse = tool({
    description:
        'Create a server response on a Postman mock server. Use when you need to simulate 5xx server-level responses (500, 503, etc.) for testing error conditions.',
    inputSchema: z.object({
        ...authField,
        mockId: z.string().describe('The unique identifier of the mock server (UUID format)'),
        ...serverResponseFields,
    }),
    execute: async ({ postmanApiKey, mockId, name, statusCode, headers, language, body }) => {
        try {
            if (!postmanApiKey) return missingKey();
            return await postmanRequest(postmanApiKey, 'POST', `/mocks/${encodeURIComponent(mockId)}/server-responses`, {
                body: {
                    serverResponse: {
                        name,
                        ...(statusCode !== undefined ? { statusCode } : {}),
                        ...(headers !== undefined ? { headers } : {}),
                        ...(language !== undefined ? { language } : {}),
                        ...(body !== undefined ? { body } : {}),
                    },
                },
            });
        } catch (error) {
            return toPostmanError(error, 'Failed to create server response');
        }
    },
});

export const postmanUpdateAServerResponse = tool({
    description:
        "Update a mock server's server response. Use when you need to modify properties of an existing server response such as name, status code, language, body, or headers. At least one property must be included in the update request.",
    inputSchema: z.object({
        ...authField,
        mockId: z.string().describe('The mock server unique identifier (UUID format)'),
        serverResponseId: z.string().describe('The server response unique identifier (UUID format) to update'),
        name: z.string().optional().describe('The name of the server response'),
        statusCode: z.number().int().optional().describe('The HTTP status code for the server response'),
        headers: z.array(z.record(z.any())).optional().describe('Array of header objects with key and value properties'),
        language: z.string().optional().describe("The language/format of the response body, e.g. 'json', 'html', 'text', 'xml'"),
        body: z.string().optional().describe('The response body content as a string'),
    }),
    execute: async ({ postmanApiKey, mockId, serverResponseId, name, statusCode, headers, language, body }) => {
        try {
            if (!postmanApiKey) return missingKey();
            return await postmanRequest(
                postmanApiKey,
                'PUT',
                `/mocks/${encodeURIComponent(mockId)}/server-responses/${encodeURIComponent(serverResponseId)}`,
                {
                    body: {
                        serverResponse: {
                            ...(name !== undefined ? { name } : {}),
                            ...(statusCode !== undefined ? { statusCode } : {}),
                            ...(headers !== undefined ? { headers } : {}),
                            ...(language !== undefined ? { language } : {}),
                            ...(body !== undefined ? { body } : {}),
                        },
                    },
                },
            );
        } catch (error) {
            return toPostmanError(error, 'Failed to update server response');
        }
    },
});

export const postmanDeleteMockServerResponse = tool({
    description:
        "Delete a mock server's server response. Use when you need to remove a specific response from a Postman mock server.",
    inputSchema: z.object({
        ...authField,
        mockId: z.string().describe('The mock server unique identifier (UUID format)'),
        serverResponseId: z.string().describe('The server response unique identifier (UUID format) to delete'),
    }),
    execute: async ({ postmanApiKey, mockId, serverResponseId }) => {
        try {
            if (!postmanApiKey) return missingKey();
            return await postmanRequest(
                postmanApiKey,
                'DELETE',
                `/mocks/${encodeURIComponent(mockId)}/server-responses/${encodeURIComponent(serverResponseId)}`,
            );
        } catch (error) {
            return toPostmanError(error, 'Failed to delete server response');
        }
    },
});

// ---- Monitors ----

const monitorSchedule = z
    .object({
        cron: z.string().optional().describe("POSIX cron pattern for run frequency, e.g. '0 0 * * *' for daily at midnight"),
        timezone: z.string().optional().describe("Timezone for the schedule, e.g. 'UTC' or 'America/New_York'"),
    })
    .describe('Schedule configuration defining when and how often the monitor should run');

const monitorOptions = z
    .record(z.any())
    .optional()
    .describe('Monitor options: strictSSL (boolean), requestDelay (ms), requestTimeout (ms), followRedirects (boolean)');

const monitorNotifications = z
    .record(z.any())
    .optional()
    .describe('Notification settings: onError and onFailure arrays of {email} recipients');

export const postmanCreateAMonitor = tool({
    description:
        'Create a new monitor in a specific workspace to run a collection on a schedule. Use when you need to set up automated collection runs at specified intervals using cron expressions within a workspace.',
    inputSchema: z.object({
        ...authField,
        workspaceId: z.string().describe('The workspace ID where the monitor will be created'),
        name: z.string().describe('Name of the monitor to be created'),
        collectionId: z.string().describe('Collection UID (owner-collectionId format) that the monitor will run'),
        schedule: monitorSchedule.describe('Schedule configuration defining when and how often the monitor should run'),
        environmentId: z.string().optional().describe('Optional environment UID to use with the monitor'),
        isActive: z.boolean().optional().describe('Whether the monitor is active. Defaults to true'),
        options: monitorOptions,
        notifications: monitorNotifications,
    }),
    execute: async ({ postmanApiKey, workspaceId, name, collectionId, schedule, environmentId, isActive, options, notifications }) => {
        try {
            if (!postmanApiKey) return missingKey();
            return await postmanRequest(postmanApiKey, 'POST', '/monitors', {
                query: { workspace: workspaceId },
                body: {
                    monitor: {
                        name,
                        collection: collectionId,
                        schedule,
                        ...(environmentId !== undefined ? { environment: environmentId } : {}),
                        ...(isActive !== undefined ? { active: isActive } : {}),
                        ...(options !== undefined ? { options } : {}),
                        ...(notifications !== undefined ? { notifications } : {}),
                    },
                },
            });
        } catch (error) {
            return toPostmanError(error, 'Failed to create monitor');
        }
    },
});

export const postmanGetAllMonitors = tool({
    description:
        'Get all monitors accessible to the authenticated user with optional workspace filtering. Use when you need to list or retrieve monitors from Postman. Returns an array of monitor objects with their IDs, names, and UIDs.',
    inputSchema: z.object({
        ...authField,
        workspaceId: z.string().optional().describe('Filter by workspace ID. If not provided, returns all monitors accessible to the user'),
        limit: z.number().int().min(1).optional().describe('Maximum number of monitors to return per page'),
        cursor: z.string().optional().describe('Pagination cursor from a previous response'),
    }),
    execute: async ({ postmanApiKey, workspaceId, limit, cursor }) => {
        try {
            if (!postmanApiKey) return missingKey();
            return await postmanRequest(postmanApiKey, 'GET', '/monitors', {
                query: { workspace: workspaceId, limit, cursor },
            });
        } catch (error) {
            return toPostmanError(error, 'Failed to get monitors');
        }
    },
});

export const postmanGetMonitorInformation = tool({
    description:
        'Retrieve information about a specific monitor in Postman. Use when you need to fetch monitor details including schedule, collection, environment, and run status.',
    inputSchema: z.object({
        ...authField,
        monitorId: z.string().describe('The unique identifier of the monitor to retrieve'),
    }),
    execute: async ({ postmanApiKey, monitorId }) => {
        try {
            if (!postmanApiKey) return missingKey();
            return await postmanRequest(postmanApiKey, 'GET', `/monitors/${encodeURIComponent(monitorId)}`);
        } catch (error) {
            return toPostmanError(error, 'Failed to get monitor');
        }
    },
});

export const postmanUpdateAMonitor = tool({
    description:
        'Update an existing monitor in Postman. Use when you need to modify monitor properties like name, active status, collection, environment, options, notifications, or distribution settings.',
    inputSchema: z.object({
        ...authField,
        monitorId: z.string().describe('The unique identifier (ID or UID) of the monitor to update'),
        name: z.string().optional().describe('The new monitor name'),
        isActive: z.boolean().optional().describe('Whether the monitor is active'),
        collectionId: z.string().optional().describe('The collection UID to monitor. Update to change which collection the monitor runs'),
        environmentId: z.string().optional().describe('The environment UID to use with the monitor'),
        schedule: monitorSchedule.optional().describe('Updated schedule configuration'),
        options: monitorOptions,
        notifications: monitorNotifications,
    }),
    execute: async ({ postmanApiKey, monitorId, name, isActive, collectionId, environmentId, schedule, options, notifications }) => {
        try {
            if (!postmanApiKey) return missingKey();
            return await postmanRequest(postmanApiKey, 'PUT', `/monitors/${encodeURIComponent(monitorId)}`, {
                body: {
                    monitor: {
                        ...(name !== undefined ? { name } : {}),
                        ...(isActive !== undefined ? { active: isActive } : {}),
                        ...(collectionId !== undefined ? { collection: collectionId } : {}),
                        ...(environmentId !== undefined ? { environment: environmentId } : {}),
                        ...(schedule !== undefined ? { schedule } : {}),
                        ...(options !== undefined ? { options } : {}),
                        ...(notifications !== undefined ? { notifications } : {}),
                    },
                },
            });
        } catch (error) {
            return toPostmanError(error, 'Failed to update monitor');
        }
    },
});

export const postmanDeleteMonitor = tool({
    description:
        'Delete a monitor by its ID. Use when you need to permanently remove a monitor from Postman.',
    inputSchema: z.object({
        ...authField,
        monitorId: z.string().describe('The ID of the monitor to delete'),
    }),
    execute: async ({ postmanApiKey, monitorId }) => {
        try {
            if (!postmanApiKey) return missingKey();
            return await postmanRequest(postmanApiKey, 'DELETE', `/monitors/${encodeURIComponent(monitorId)}`);
        } catch (error) {
            return toPostmanError(error, 'Failed to delete monitor');
        }
    },
});

export const postmanRunAMonitor = tool({
    description:
        'Trigger an immediate run of a monitor and retrieve its execution results. Use when you need to manually execute a monitor outside of its scheduled runs.',
    inputSchema: z.object({
        ...authField,
        monitorId: z.string().describe('The unique identifier (ID or UID) of the monitor to run'),
    }),
    execute: async ({ postmanApiKey, monitorId }) => {
        try {
            if (!postmanApiKey) return missingKey();
            return await postmanRequest(postmanApiKey, 'POST', `/monitors/${encodeURIComponent(monitorId)}/run`);
        } catch (error) {
            return toPostmanError(error, 'Failed to run monitor');
        }
    },
});
