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

export const postmanCreateACollection = tool({
    description:
        'Create a new Postman collection in a specific workspace or the default workspace. Use when you need to create a collection with workspace specification. For complete collection format details, refer to the Postman Collection Format documentation.',
    inputSchema: z.object({
        ...authField,
        workspaceId: z.string().optional().describe('Workspace ID where the collection will be created. If not specified, the collection is created in the default workspace'),
        collection: z
            .record(z.any())
            .describe(
                'Collection object with info {name, description?, schema?} and optional item array of requests/folders, e.g. {"info": {"name": "My API Collection", "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"}, "item": []}',
            ),
    }),
    execute: async ({ postmanApiKey, workspaceId, collection }) => {
        try {
            if (!postmanApiKey) return missingKey();
            return await postmanRequest(postmanApiKey, 'POST', '/collections', {
                query: { workspace: workspaceId },
                body: { collection },
            });
        } catch (error) {
            return toPostmanError(error, 'Failed to create collection');
        }
    },
});

export const postmanGetAllCollections = tool({
    description:
        "Get all collections accessible to the authenticated user. Use when you need to retrieve all your collections including subscribed collections. Returns detailed information for each collection including owner, creation/update timestamps, and visibility.",
    inputSchema: z.object({
        ...authField,
        workspaceId: z.string().optional().describe('Filter collections by workspace ID. Omit to get collections across all workspaces'),
        name: z.string().optional().describe('Filter collections by name'),
        limit: z.number().int().min(1).optional().describe('Maximum number of collections to return per page'),
        cursor: z.string().optional().describe('Pagination cursor from a previous response (nextCursor)'),
        offset: z.number().int().min(0).optional().describe('Offset for pagination'),
    }),
    execute: async ({ postmanApiKey, workspaceId, name, limit, cursor, offset }) => {
        try {
            if (!postmanApiKey) return missingKey();
            return await postmanRequest(postmanApiKey, 'GET', '/collections', {
                query: { workspace: workspaceId, name, limit, cursor, offset },
            });
        } catch (error) {
            return toPostmanError(error, 'Failed to get collections');
        }
    },
});

export const postmanDeleteACollection = tool({
    description:
        'Permanently delete a collection from Postman. Use when you need to remove a collection that is no longer needed.',
    inputSchema: z.object({
        ...authField,
        collectionId: z.string().describe('The unique identifier (UID or ID) of the collection to delete'),
    }),
    execute: async ({ postmanApiKey, collectionId }) => {
        try {
            if (!postmanApiKey) return missingKey();
            return await postmanRequest(postmanApiKey, 'DELETE', `/collections/${encodeURIComponent(collectionId)}`);
        } catch (error) {
            return toPostmanError(error, 'Failed to delete collection');
        }
    },
});

export const postmanDuplicateACollection = tool({
    description:
        'Create a duplicate of a collection in another workspace. Use when you need to copy an existing collection to a different workspace. Returns an asynchronous task that can be tracked using the duplication task status endpoint.',
    inputSchema: z.object({
        ...authField,
        collectionId: z.string().describe('The unique identifier (UID) of the collection to duplicate'),
        workspaceId: z.string().describe('The ID of the workspace where the duplicated collection will be created'),
        suffix: z.string().optional().describe('Optional suffix appended to the duplicated collection name'),
    }),
    execute: async ({ postmanApiKey, collectionId, workspaceId, suffix }) => {
        try {
            if (!postmanApiKey) return missingKey();
            return await postmanRequest(postmanApiKey, 'POST', `/collections/${encodeURIComponent(collectionId)}/duplicates`, {
                body: { workspace: workspaceId, ...(suffix !== undefined ? { suffix } : {}) },
            });
        } catch (error) {
            return toPostmanError(error, 'Failed to duplicate collection');
        }
    },
});

export const postmanGetDuplicationTaskStatus = tool({
    description:
        'Get the status of a collection duplication task. Use when you need to check whether a previously initiated collection duplication is still processing or has completed. The task ID is obtained from the duplicate-a-collection response.',
    inputSchema: z.object({
        ...authField,
        taskId: z.string().describe('The ID of the collection duplication task'),
    }),
    execute: async ({ postmanApiKey, taskId }) => {
        try {
            if (!postmanApiKey) return missingKey();
            return await postmanRequest(postmanApiKey, 'GET', `/collection-duplicate-tasks/${encodeURIComponent(taskId)}`);
        } catch (error) {
            return toPostmanError(error, 'Failed to get duplication task status');
        }
    },
});

export const postmanForkCollection = tool({
    description:
        'Create a fork of a collection in a specified workspace. Use when you need to fork an existing collection to a workspace.',
    inputSchema: z.object({
        ...authField,
        collectionId: z.string().describe('The unique identifier (UID) of the collection to fork'),
        workspaceId: z.string().describe('The workspace ID where the forked collection will be created'),
        label: z.string().optional().describe('Label or name for the fork. If not provided, the fork is created with a default label'),
    }),
    execute: async ({ postmanApiKey, collectionId, workspaceId, label }) => {
        try {
            if (!postmanApiKey) return missingKey();
            return await postmanRequest(postmanApiKey, 'POST', `/collections/fork/${encodeURIComponent(collectionId)}`, {
                query: { workspace: workspaceId },
                body: { ...(label !== undefined ? { label } : {}) },
            });
        } catch (error) {
            return toPostmanError(error, 'Failed to fork collection');
        }
    },
});

export const postmanGetCollectionForks = tool({
    description:
        'Get all forks of a specific collection. Use when you need to retrieve information about who has forked a collection, including fork IDs, users, and creation dates.',
    inputSchema: z.object({
        ...authField,
        collectionId: z.string().describe('The unique identifier (UID) of the collection whose forks you want to retrieve'),
    }),
    execute: async ({ postmanApiKey, collectionId }) => {
        try {
            if (!postmanApiKey) return missingKey();
            return await postmanRequest(postmanApiKey, 'GET', `/collections/${encodeURIComponent(collectionId)}/forks`);
        } catch (error) {
            return toPostmanError(error, 'Failed to get collection forks');
        }
    },
});

export const postmanGetAllForkedCollections = tool({
    description:
        'Retrieve all forked collections for the authenticated user. Use when you need to list or access all collections that the user has forked.',
    inputSchema: z.object({
        ...authField,
        limit: z.number().int().min(1).optional().describe('Maximum number of forked collections to return per page'),
        cursor: z.string().optional().describe('Pagination cursor from a previous response'),
        direction: z.enum(['asc', 'desc']).optional().describe('Sort direction for the results'),
    }),
    execute: async ({ postmanApiKey, limit, cursor, direction }) => {
        try {
            if (!postmanApiKey) return missingKey();
            return await postmanRequest(postmanApiKey, 'GET', '/collections/collection-forks', {
                query: { limit, cursor, direction },
            });
        } catch (error) {
            return toPostmanError(error, 'Failed to get forked collections');
        }
    },
});

export const postmanPullSourceChangesIntoFork = tool({
    description:
        'Pull changes from a parent (source) collection into a forked collection. Use when you need to sync a forked collection with its parent.',
    inputSchema: z.object({
        ...authField,
        collectionId: z.string().describe('The ID of the forked collection that will receive the changes from its parent (source) collection'),
    }),
    execute: async ({ postmanApiKey, collectionId }) => {
        try {
            if (!postmanApiKey) return missingKey();
            return await postmanRequest(postmanApiKey, 'PUT', `/collections/${encodeURIComponent(collectionId)}/pulls`);
        } catch (error) {
            return toPostmanError(error, 'Failed to pull source changes');
        }
    },
});

export const postmanGetSourceCollectionStatus = tool({
    description:
        'Check whether there is a change between a forked collection and its parent (source) collection. Use when you need to determine if the source collection has updates that are not yet in the forked collection. This endpoint only works with forked collections; attempting to use it with regular collections will result in an error.',
    inputSchema: z.object({
        ...authField,
        collectionId: z.string().describe('The ID of a forked collection to check against its parent (source) collection'),
    }),
    execute: async ({ postmanApiKey, collectionId }) => {
        try {
            if (!postmanApiKey) return missingKey();
            return await postmanRequest(postmanApiKey, 'GET', `/collections/${encodeURIComponent(collectionId)}/source-status`);
        } catch (error) {
            return toPostmanError(error, 'Failed to get source collection status');
        }
    },
});

export const postmanReplaceCollectionDataAsynchronously = tool({
    description:
        "Replace the entire contents of a collection asynchronously. Use when you need to completely replace a collection with new data. IMPORTANT: Include the collection's ID values in item, variable, and other nested objects to preserve them. If you do not include IDs, the endpoint removes existing items and creates new items. Returns a task to track with the async collection update status tool.",
    inputSchema: z.object({
        ...authField,
        collectionId: z.string().describe('The unique identifier (ID or UID) of the collection to replace'),
        collection: z
            .record(z.any())
            .describe(
                'Complete collection object to replace the existing collection: info {name, description?, schema?}, optional item array (include existing item IDs to preserve them), auth, variable, and event',
            ),
    }),
    execute: async ({ postmanApiKey, collectionId, collection }) => {
        try {
            if (!postmanApiKey) return missingKey();
            return await postmanRequest(postmanApiKey, 'PUT', `/collections/${encodeURIComponent(collectionId)}`, {
                body: { collection },
                preferAsync: true,
            });
        } catch (error) {
            return toPostmanError(error, 'Failed to replace collection data');
        }
    },
});

export const postmanGetAsyncCollectionUpdateStatus = tool({
    description:
        'Get the status of an asynchronous collection update task. Use when you need to check whether a previously initiated async collection update is still processing, has completed successfully, or has failed. The task ID is obtained from PUT /collections/{collectionId} when using the Prefer: respond-async header.',
    inputSchema: z.object({
        ...authField,
        taskId: z.string().describe('The ID of the asynchronous collection update task'),
    }),
    execute: async ({ postmanApiKey, taskId }) => {
        try {
            if (!postmanApiKey) return missingKey();
            return await postmanRequest(postmanApiKey, 'GET', `/collection-updates-tasks/${encodeURIComponent(taskId)}`);
        } catch (error) {
            return toPostmanError(error, 'Failed to get async collection update status');
        }
    },
});

export const postmanTransferFolders = tool({
    description:
        'Copy or move folders into a collection or folder. Use when you need to reorganize collections by transferring folders between collections or into other folders.',
    inputSchema: z.object({
        ...authField,
        ids: z
            .array(z.string())
            .min(1)
            .describe("Array of folder unique identifiers (UIDs) to transfer, e.g. ['ownerId-folderId']. All folders must exist and be accessible"),
        target: z
            .object({
                id: z.string().describe('UID of the target collection or folder, e.g. ownerId-collectionId'),
                model: z.enum(['collection', 'folder']).describe("Use 'collection' to transfer into a collection root, or 'folder' to transfer into a specific folder"),
            })
            .describe('Target location where folders should be transferred'),
        location: z
            .object({
                position: z.string().describe("Position where folders should be placed in the target, e.g. 'start' or 'end'"),
                id: z.string().optional().describe('Optional ID to position relative to a specific item'),
                model: z.string().optional().describe("Optional model type for positioning, e.g. 'collection', 'folder', or 'request'"),
            })
            .describe('Position within the target where folders should be placed'),
        mode: z.enum(['copy', 'move']).describe("Transfer mode: 'copy' duplicates folders in the target, 'move' relocates them (removes from source)"),
    }),
    execute: async ({ postmanApiKey, ids, target, location, mode }) => {
        try {
            if (!postmanApiKey) return missingKey();
            return await postmanRequest(postmanApiKey, 'POST', '/collection-folders-transfers', {
                body: { ids, target, location, mode },
            });
        } catch (error) {
            return toPostmanError(error, 'Failed to transfer folders');
        }
    },
});

export const postmanTransformCollectionToOpenApi = tool({
    description:
        'Transform an existing Postman Collection into a stringified OpenAPI 3.0.3 definition. Use when you need to convert a collection to OpenAPI format for API documentation or interoperability with other tools.',
    inputSchema: z.object({
        ...authField,
        collectionId: z.string().describe('The unique identifier of the collection to transform into OpenAPI format'),
    }),
    execute: async ({ postmanApiKey, collectionId }) => {
        try {
            if (!postmanApiKey) return missingKey();
            return await postmanRequest(postmanApiKey, 'GET', `/collections/${encodeURIComponent(collectionId)}/transformations`);
        } catch (error) {
            return toPostmanError(error, 'Failed to transform collection to OpenAPI');
        }
    },
});

export const postmanUpdateCollectionProperties = tool({
    description:
        'Update specific collection properties like name, description, authentication, variables, or events. Use when you need to partially update a collection without replacing the entire collection structure. Returns the updated collection information after the changes are applied.',
    inputSchema: z.object({
        ...authField,
        collectionId: z.string().describe('The unique identifier (ID or UID) of the collection to update'),
        collection: z
            .record(z.any())
            .describe(
                'Collection properties to update. Only the specified properties are updated, e.g. {"info": {"name": "Updated name"}, "auth": {...}, "variable": [...], "event": [...]}',
            ),
    }),
    execute: async ({ postmanApiKey, collectionId, collection }) => {
        try {
            if (!postmanApiKey) return missingKey();
            return await postmanRequest(postmanApiKey, 'PATCH', `/collections/${encodeURIComponent(collectionId)}`, {
                body: { collection },
            });
        } catch (error) {
            return toPostmanError(error, 'Failed to update collection');
        }
    },
});

export const postmanGetCollectionRoles = tool({
    description:
        'Get information about all roles in a collection. Use when you need to retrieve the IDs of all users, teams, and groups with access to view or edit a collection.',
    inputSchema: z.object({
        ...authField,
        collectionId: z.string().describe('The unique identifier of the collection to retrieve roles for'),
    }),
    execute: async ({ postmanApiKey, collectionId }) => {
        try {
            if (!postmanApiKey) return missingKey();
            return await postmanRequest(postmanApiKey, 'GET', `/collections/${encodeURIComponent(collectionId)}/roles`);
        } catch (error) {
            return toPostmanError(error, 'Failed to get collection roles');
        }
    },
});

export const postmanGetCollectionAccessKeys = tool({
    description:
        'Retrieve all personal and team collection access keys for the authenticated user. Use when you need to list or manage collection access keys. Returns an array of access key objects with their IDs, tokens, status, and associated collection information.',
    inputSchema: z.object({
        ...authField,
        collectionId: z.string().optional().describe('Filter access keys by collection UID'),
        cursor: z.string().optional().describe('Pagination cursor from a previous response'),
    }),
    execute: async ({ postmanApiKey, collectionId, cursor }) => {
        try {
            if (!postmanApiKey) return missingKey();
            return await postmanRequest(postmanApiKey, 'GET', '/collection-access-keys', {
                query: { collectionId, cursor },
            });
        } catch (error) {
            return toPostmanError(error, 'Failed to get collection access keys');
        }
    },
});
