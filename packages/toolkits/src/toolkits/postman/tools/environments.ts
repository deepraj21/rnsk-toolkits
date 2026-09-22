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

const environmentVariable = z
    .object({
        key: z.string().describe('The name/key of the environment variable'),
        value: z.string().describe('The value of the environment variable'),
        type: z.enum(['default', 'secret']).optional().describe("Use 'default' for regular variables or 'secret' for sensitive values"),
        enabled: z.boolean().optional().describe('Whether the variable is enabled and active in the environment'),
    })
    .describe('Individual environment variable');

export const postmanCreateAnEnvironment = tool({
    description:
        'Create a new environment in a Postman workspace. Use when you need to create a new environment with variables for different settings (development, production, testing, etc.). Returns the created environment ID, name, and UID.',
    inputSchema: z.object({
        ...authField,
        workspaceId: z.string().describe('The workspace ID where the environment will be created'),
        name: z.string().describe('The name of the environment to create, e.g. Development, Production'),
        values: z.array(environmentVariable).optional().describe('Array of environment variables with key, value, type, and enabled properties'),
    }),
    execute: async ({ postmanApiKey, workspaceId, name, values }) => {
        try {
            if (!postmanApiKey) return missingKey();
            return await postmanRequest(postmanApiKey, 'POST', '/environments', {
                query: { workspace: workspaceId },
                body: { environment: { name, ...(values !== undefined ? { values } : {}) } },
            });
        } catch (error) {
            return toPostmanError(error, 'Failed to create environment');
        }
    },
});

export const postmanGetAllEnvironments = tool({
    description:
        'Get all environments accessible to the authenticated user with optional workspace filtering. Use when you need to list or retrieve environments from Postman. Returns an array of environment objects with their IDs, names, and UIDs.',
    inputSchema: z.object({
        ...authField,
        workspaceId: z.string().optional().describe('Filter by workspace ID. If not provided, returns all environments accessible to the user'),
        limit: z.number().int().min(1).optional().describe('Maximum number of environments to return per page'),
        cursor: z.string().optional().describe('Pagination cursor from a previous response'),
    }),
    execute: async ({ postmanApiKey, workspaceId, limit, cursor }) => {
        try {
            if (!postmanApiKey) return missingKey();
            return await postmanRequest(postmanApiKey, 'GET', '/environments', {
                query: { workspace: workspaceId, limit, cursor },
            });
        } catch (error) {
            return toPostmanError(error, 'Failed to get environments');
        }
    },
});

export const postmanGetAnEnvironment = tool({
    description:
        'Retrieve detailed information about a specific environment in Postman. Use when you need to fetch environment details including name, ID, owner, and all environment variables.',
    inputSchema: z.object({
        ...authField,
        environmentId: z.string().describe('The unique identifier (ID or UID) of the environment to retrieve'),
    }),
    execute: async ({ postmanApiKey, environmentId }) => {
        try {
            if (!postmanApiKey) return missingKey();
            return await postmanRequest(postmanApiKey, 'GET', `/environments/${encodeURIComponent(environmentId)}`);
        } catch (error) {
            return toPostmanError(error, 'Failed to get environment');
        }
    },
});

export const postmanDeleteAnEnvironment = tool({
    description:
        'Delete an environment permanently in Postman. Use when you need to remove an environment that is no longer needed.',
    inputSchema: z.object({
        ...authField,
        environmentId: z.string().describe('The environment ID or UID to delete'),
    }),
    execute: async ({ postmanApiKey, environmentId }) => {
        try {
            if (!postmanApiKey) return missingKey();
            return await postmanRequest(postmanApiKey, 'DELETE', `/environments/${encodeURIComponent(environmentId)}`);
        } catch (error) {
            return toPostmanError(error, 'Failed to delete environment');
        }
    },
});

export const postmanReplaceAnEnvironmentsData = tool({
    description:
        "Completely replace an environment's data with new variables and values. Use when you need to update an entire environment by replacing all its contents. This operation replaces ALL existing variables with the ones provided in the request.",
    inputSchema: z.object({
        ...authField,
        environmentId: z.string().describe('The unique identifier (ID or UID) of the environment to replace'),
        name: z.string().describe('The name of the environment'),
        values: z.array(environmentVariable).optional().describe('Array of environment variables. This replaces ALL existing variables in the environment'),
    }),
    execute: async ({ postmanApiKey, environmentId, name, values }) => {
        try {
            if (!postmanApiKey) return missingKey();
            return await postmanRequest(postmanApiKey, 'PUT', `/environments/${encodeURIComponent(environmentId)}`, {
                body: { environment: { name, ...(values !== undefined ? { values } : {}) } },
            });
        } catch (error) {
            return toPostmanError(error, 'Failed to replace environment data');
        }
    },
});

const jsonPatchOperation = z
    .object({
        op: z.enum(['replace', 'add', 'remove', 'copy', 'move', 'test']).describe("The operation type: 'replace' updates existing fields, 'add' creates new fields or appends to arrays, 'remove' deletes fields, 'copy'/'move' copy from another path (requires 'from')"),
        path: z.string().describe("JSON pointer to the field to modify, e.g. '/name' for the environment name or '/values/0/value' for a variable value"),
        value: z.any().optional().describe("New value for the field. Required for 'replace' and 'add' operations"),
        from: z.string().optional().describe("Source JSON pointer for 'copy' and 'move' operations (RFC 6902)"),
    })
    .describe('JSON Patch operation following RFC 6902');

export const postmanUpdateAnEnvironment = tool({
    description:
        'Update specific environment properties using JSON Patch operations (RFC 6902). Use when you need to modify environment name or variables without replacing the entire environment.',
    inputSchema: z.object({
        ...authField,
        environmentId: z.string().describe('The unique identifier (ID or UID) of the environment to update'),
        operations: z
            .array(jsonPatchOperation)
            .min(1)
            .describe(
                "Array of JSON Patch operations to apply, e.g. [{'op': 'replace', 'path': '/name', 'value': 'production'}]",
            ),
    }),
    execute: async ({ postmanApiKey, environmentId, operations }) => {
        try {
            if (!postmanApiKey) return missingKey();
            return await postmanRequest(postmanApiKey, 'PATCH', `/environments/${encodeURIComponent(environmentId)}`, {
                body: operations,
            });
        } catch (error) {
            return toPostmanError(error, 'Failed to update environment');
        }
    },
});

export const postmanCreateEnvironmentFork = tool({
    description:
        'Create a fork from an existing environment into a workspace. Use when you need to fork an environment to a specified workspace.',
    inputSchema: z.object({
        ...authField,
        environmentUid: z.string().describe('The UID of the environment to fork'),
        workspaceId: z.string().describe('The workspace ID where the forked environment will be created'),
        forkName: z.string().describe('A name for the forked environment'),
    }),
    execute: async ({ postmanApiKey, environmentUid, workspaceId, forkName }) => {
        try {
            if (!postmanApiKey) return missingKey();
            return await postmanRequest(postmanApiKey, 'POST', `/environments/${encodeURIComponent(environmentUid)}/forks`, {
                query: { workspaceId },
                body: { forkName },
            });
        } catch (error) {
            return toPostmanError(error, 'Failed to create environment fork');
        }
    },
});

export const postmanGetEnvironmentForks = tool({
    description:
        'Retrieve all forked environments for a specific environment. Use when you need to list all environments that have been forked from a particular environment.',
    inputSchema: z.object({
        ...authField,
        environmentUid: z.string().describe('The environment UID to retrieve forks for'),
    }),
    execute: async ({ postmanApiKey, environmentUid }) => {
        try {
            if (!postmanApiKey) return missingKey();
            return await postmanRequest(postmanApiKey, 'GET', `/environments/${encodeURIComponent(environmentUid)}/forks`);
        } catch (error) {
            return toPostmanError(error, 'Failed to get environment forks');
        }
    },
});

export const postmanMergeAForkedEnvironment = tool({
    description:
        'Merge a forked environment back into its parent environment. Use when you need to merge changes from a forked environment into the parent.',
    inputSchema: z.object({
        ...authField,
        environmentUid: z.string().describe('The UID of the parent (destination) environment where changes will be merged into'),
        source: z.string().describe('The UID of the forked (source) environment to merge from'),
        deleteSource: z.boolean().optional().describe('If true, delete the forked environment after merging'),
    }),
    execute: async ({ postmanApiKey, environmentUid, source, deleteSource }) => {
        try {
            if (!postmanApiKey) return missingKey();
            return await postmanRequest(postmanApiKey, 'POST', `/environments/${encodeURIComponent(environmentUid)}/merges`, {
                body: { source, ...(deleteSource !== undefined ? { deleteSource } : {}) },
            });
        } catch (error) {
            return toPostmanError(error, 'Failed to merge forked environment');
        }
    },
});
