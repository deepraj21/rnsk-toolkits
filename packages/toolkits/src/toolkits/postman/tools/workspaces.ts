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

const workspaceType = z.enum(['personal', 'team', 'private', 'public']).describe('The type of workspace');

export const postmanCreateAWorkspace = tool({
    description:
        'Create a new workspace in Postman. Use when you need to create a workspace with a specified name, type (personal, team, private, or public), and optional description. Returns the created workspace ID, name, and type.',
    inputSchema: z.object({
        ...authField,
        name: z.string().describe('The name of the workspace to create'),
        type: workspaceType,
        description: z.string().optional().describe('A detailed description of the workspace'),
    }),
    execute: async ({ postmanApiKey, name, type, description }) => {
        try {
            if (!postmanApiKey) return missingKey();
            return await postmanRequest(postmanApiKey, 'POST', '/workspaces', {
                body: { workspace: { name, type, ...(description !== undefined ? { description } : {}) } },
            });
        } catch (error) {
            return toPostmanError(error, 'Failed to create workspace');
        }
    },
});

export const postmanGetAllWorkspaces = tool({
    description:
        'Get all workspaces accessible to the authenticated user with optional type filtering. Use when you need to list or retrieve workspaces from Postman. Returns an array of workspace objects with their IDs, names, and types.',
    inputSchema: z.object({
        ...authField,
        type: z.enum(['personal', 'team', 'public']).optional().describe("Filter by workspace type. If not provided, returns all workspaces accessible to the user"),
    }),
    execute: async ({ postmanApiKey, type }) => {
        try {
            if (!postmanApiKey) return missingKey();
            return await postmanRequest(postmanApiKey, 'GET', '/workspaces', {
                query: { type },
            });
        } catch (error) {
            return toPostmanError(error, 'Failed to get workspaces');
        }
    },
});

export const postmanGetWorkspaceDetails = tool({
    description:
        'Get detailed information about a specific workspace by its ID. Use when you need to retrieve the complete structure of a workspace including all collections, environments, APIs, mocks, and monitors.',
    inputSchema: z.object({
        ...authField,
        workspaceId: z.string().describe('The unique identifier of the workspace to retrieve'),
    }),
    execute: async ({ postmanApiKey, workspaceId }) => {
        try {
            if (!postmanApiKey) return missingKey();
            return await postmanRequest(postmanApiKey, 'GET', `/workspaces/${encodeURIComponent(workspaceId)}`);
        } catch (error) {
            return toPostmanError(error, 'Failed to get workspace');
        }
    },
});

export const postmanUpdateAWorkspace = tool({
    description:
        "Update an existing workspace in Postman. Use when you need to modify the name, type, or description of a workspace. The 'type' field is required for all updates.",
    inputSchema: z.object({
        ...authField,
        workspaceId: z.string().describe('The unique identifier of the workspace to update'),
        name: z.string().optional().describe('The new name of the workspace'),
        type: workspaceType.describe('The type of the workspace. Required field for updates'),
        description: z.string().optional().describe('The new description of the workspace'),
    }),
    execute: async ({ postmanApiKey, workspaceId, name, type, description }) => {
        try {
            if (!postmanApiKey) return missingKey();
            return await postmanRequest(postmanApiKey, 'PUT', `/workspaces/${encodeURIComponent(workspaceId)}`, {
                body: {
                    workspace: {
                        type,
                        ...(name !== undefined ? { name } : {}),
                        ...(description !== undefined ? { description } : {}),
                    },
                },
            });
        } catch (error) {
            return toPostmanError(error, 'Failed to update workspace');
        }
    },
});

export const postmanDeleteAWorkspace = tool({
    description:
        'Delete a Postman workspace permanently. Use when you need to remove a workspace and all its contents. Deletion is permanent and cannot be undone.',
    inputSchema: z.object({
        ...authField,
        workspaceId: z.string().describe('The ID of the workspace to delete'),
    }),
    execute: async ({ postmanApiKey, workspaceId }) => {
        try {
            if (!postmanApiKey) return missingKey();
            return await postmanRequest(postmanApiKey, 'DELETE', `/workspaces/${encodeURIComponent(workspaceId)}`);
        } catch (error) {
            return toPostmanError(error, 'Failed to delete workspace');
        }
    },
});

export const postmanGetWorkspaceActivityFeed = tool({
    description:
        "Get a workspace's activity feed showing who added or removed collections, environments, or elements, and users joining or leaving. Use when you need to track workspace changes and user activity.",
    inputSchema: z.object({
        ...authField,
        workspaceId: z.string().describe('The ID of the workspace to get the activity feed for'),
        limit: z.number().int().min(1).optional().describe('The maximum number of activities to return for pagination'),
        cursor: z.string().optional().describe('Cursor for pagination. Use the nextCursor value from the previous response'),
    }),
    execute: async ({ postmanApiKey, workspaceId, limit, cursor }) => {
        try {
            if (!postmanApiKey) return missingKey();
            return await postmanRequest(postmanApiKey, 'GET', `/workspaces/${encodeURIComponent(workspaceId)}/activities`, {
                query: { limit, cursor },
            });
        } catch (error) {
            return toPostmanError(error, 'Failed to get workspace activity feed');
        }
    },
});

export const postmanGetWorkspaceRoles = tool({
    description:
        'Get the roles of users, user groups, and partners in a workspace. Use when you need to retrieve role assignments and understand who has what level of access to a specific workspace.',
    inputSchema: z.object({
        ...authField,
        workspaceId: z.string().describe('The unique identifier of the workspace to retrieve roles for'),
    }),
    execute: async ({ postmanApiKey, workspaceId }) => {
        try {
            if (!postmanApiKey) return missingKey();
            return await postmanRequest(postmanApiKey, 'GET', `/workspaces/${encodeURIComponent(workspaceId)}/roles`);
        } catch (error) {
            return toPostmanError(error, 'Failed to get workspace roles');
        }
    },
});

const globalVariable = z
    .object({
        key: z.string().describe('The name/key of the global variable'),
        value: z.string().describe('The value of the global variable'),
        type: z.string().optional().describe("The type of the global variable, typically 'default' or 'secret'"),
        enabled: z.boolean().optional().describe('Whether the global variable is enabled or not'),
    })
    .describe('Individual global variable');

export const postmanGetWorkspaceGlobalVariables = tool({
    description:
        "Get a workspace's global variables. Use when you need to retrieve global variables that are available throughout a workspace for access between collections, requests, scripts, and environments. Note that this endpoint only works with personal or team workspaces, not public workspaces.",
    inputSchema: z.object({
        ...authField,
        workspaceId: z.string().describe('The unique identifier of the workspace to retrieve global variables from'),
    }),
    execute: async ({ postmanApiKey, workspaceId }) => {
        try {
            if (!postmanApiKey) return missingKey();
            return await postmanRequest(
                postmanApiKey,
                'GET',
                `/workspaces/${encodeURIComponent(workspaceId)}/global-variables`,
            );
        } catch (error) {
            return toPostmanError(error, 'Failed to get workspace global variables');
        }
    },
});

export const postmanUpdateWorkspaceGlobalVariables = tool({
    description:
        "Update and replace a workspace's global variables. Use when you need to set or replace all global variables in a workspace. Note: This endpoint replaces all existing global variables with the provided list.",
    inputSchema: z.object({
        ...authField,
        workspaceId: z.string().describe('The unique identifier of the workspace to update global variables for'),
        values: z
            .array(globalVariable)
            .min(1)
            .describe('Array of global variable objects to set. This replaces all existing global variables in the workspace'),
    }),
    execute: async ({ postmanApiKey, workspaceId, values }) => {
        try {
            if (!postmanApiKey) return missingKey();
            return await postmanRequest(
                postmanApiKey,
                'PUT',
                `/workspaces/${encodeURIComponent(workspaceId)}/global-variables`,
                { body: { values } },
            );
        } catch (error) {
            return toPostmanError(error, 'Failed to update workspace global variables');
        }
    },
});
