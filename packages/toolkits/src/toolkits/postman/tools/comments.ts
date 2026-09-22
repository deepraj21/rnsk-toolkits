// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { postmanRequest, toPostmanError } from './client.js';

const authField = {
    postmanApiKey: z.string().optional().describe('Injected by system; do not provide'),
};

const commentIdField = z
    .union([z.string(), z.number()])
    .describe('The unique identifier of the comment');

const threadIdField = z
    .number()
    .int()
    .optional()
    .describe('Optional thread ID to reply to an existing comment. If provided, this comment is added as a reply to the thread');

function missingKey() {
    return { error: 'Postman API key is required. Connect Postman first.' };
}

function commentPath(base: string, commentId?: string | number) {
    return commentId === undefined ? base : `${base}/${encodeURIComponent(String(commentId))}`;
}

// ---- API collection comments (POST /apis/{apiId}/collections/{collectionId}/comments) ----

export const postmanCreateACollectionComment = tool({
    description:
        "Create a comment on an API's collection. Use when you need to add a comment to a specific collection within an API. To create a reply on an existing comment, include the thread ID in the request.",
    inputSchema: z.object({
        ...authField,
        apiId: z.string().describe('The API unique identifier (UUID) containing the collection'),
        collectionId: z.string().describe('The collection unique identifier (UUID) to comment on'),
        body: z.string().describe('The text content of the comment to create on the API collection'),
        threadId: threadIdField,
    }),
    execute: async ({ postmanApiKey, apiId, collectionId, body, threadId }) => {
        try {
            if (!postmanApiKey) return missingKey();
            return await postmanRequest(
                postmanApiKey,
                'POST',
                `/apis/${encodeURIComponent(apiId)}/collections/${encodeURIComponent(collectionId)}/comments`,
                { body: { body, ...(threadId !== undefined ? { threadId } : {}) } },
            );
        } catch (error) {
            return toPostmanError(error, 'Failed to create collection comment');
        }
    },
});

export const postmanGetCollectionComments = tool({
    description:
        "Retrieve all comments left by users in an API's collection. Use when you need to fetch all comments associated with a specific collection within an API.",
    inputSchema: z.object({
        ...authField,
        apiId: z.string().describe('The API unique identifier (UUID) containing the collection'),
        collectionId: z.string().describe('The collection unique identifier (UUID) to retrieve comments from'),
    }),
    execute: async ({ postmanApiKey, apiId, collectionId }) => {
        try {
            if (!postmanApiKey) return missingKey();
            return await postmanRequest(
                postmanApiKey,
                'GET',
                `/apis/${encodeURIComponent(apiId)}/collections/${encodeURIComponent(collectionId)}/comments`,
            );
        } catch (error) {
            return toPostmanError(error, 'Failed to get collection comments');
        }
    },
});

export const postmanDeleteACollectionsComment = tool({
    description:
        "Delete a comment from an API's collection. Use when you need to remove a specific comment from a collection.",
    inputSchema: z.object({
        ...authField,
        apiId: z.string().describe('The API unique identifier (UUID) containing the collection'),
        collectionId: z.string().describe('The collection unique identifier (UUID) containing the comment'),
        commentId: commentIdField,
    }),
    execute: async ({ postmanApiKey, apiId, collectionId, commentId }) => {
        try {
            if (!postmanApiKey) return missingKey();
            return await postmanRequest(
                postmanApiKey,
                'DELETE',
                commentPath(`/apis/${encodeURIComponent(apiId)}/collections/${encodeURIComponent(collectionId)}/comments`, commentId),
            );
        } catch (error) {
            return toPostmanError(error, 'Failed to delete collection comment');
        }
    },
});

// ---- API comments (POST /apis/{apiId}/comments) ----

export const postmanGetApiComments = tool({
    description:
        'Retrieve all comments left by users in an API. Use when you need to fetch all comments associated with a specific API.',
    inputSchema: z.object({
        ...authField,
        apiId: z.string().describe('The API unique identifier (UUID) to retrieve comments from'),
    }),
    execute: async ({ postmanApiKey, apiId }) => {
        try {
            if (!postmanApiKey) return missingKey();
            return await postmanRequest(postmanApiKey, 'GET', `/apis/${encodeURIComponent(apiId)}/comments`);
        } catch (error) {
            return toPostmanError(error, 'Failed to get API comments');
        }
    },
});

export const postmanUpdateAnApisComment = tool({
    description:
        'Update a comment on an API. Use when you need to modify the text content of an existing comment on a specific API.',
    inputSchema: z.object({
        ...authField,
        apiId: z.string().describe('The API unique identifier (UUID) containing the comment to update'),
        commentId: commentIdField,
        body: z.string().describe('The updated text content of the comment'),
    }),
    execute: async ({ postmanApiKey, apiId, commentId, body }) => {
        try {
            if (!postmanApiKey) return missingKey();
            return await postmanRequest(
                postmanApiKey,
                'PUT',
                commentPath(`/apis/${encodeURIComponent(apiId)}/comments`, commentId),
                { body: { body } },
            );
        } catch (error) {
            return toPostmanError(error, 'Failed to update API comment');
        }
    },
});

export const postmanDeleteAnApisComment = tool({
    description:
        'Delete a comment from an API. Use when you need to remove a comment from a specific API. On success, returns HTTP 204 No Content.',
    inputSchema: z.object({
        ...authField,
        apiId: z.string().describe('The API unique identifier (UUID) containing the comment to delete'),
        commentId: commentIdField,
    }),
    execute: async ({ postmanApiKey, apiId, commentId }) => {
        try {
            if (!postmanApiKey) return missingKey();
            return await postmanRequest(
                postmanApiKey,
                'DELETE',
                commentPath(`/apis/${encodeURIComponent(apiId)}/comments`, commentId),
            );
        } catch (error) {
            return toPostmanError(error, 'Failed to delete API comment');
        }
    },
});

// ---- Folder comments (/collections/{collectionUid}/folders/{folderUid}/comments) ----

export const postmanCreateAFolderComment = tool({
    description:
        'Create a comment on a folder. Use when you need to add a comment to a specific folder in a collection.',
    inputSchema: z.object({
        ...authField,
        collectionUid: z.string().describe('The collection UID containing the folder'),
        folderUid: z.string().describe('The folder UID to comment on'),
        body: z.string().describe('The comment text content to post on the folder'),
        threadId: threadIdField,
    }),
    execute: async ({ postmanApiKey, collectionUid, folderUid, body, threadId }) => {
        try {
            if (!postmanApiKey) return missingKey();
            return await postmanRequest(
                postmanApiKey,
                'POST',
                `/collections/${encodeURIComponent(collectionUid)}/folders/${encodeURIComponent(folderUid)}/comments`,
                { body: { body, ...(threadId !== undefined ? { threadId } : {}) } },
            );
        } catch (error) {
            return toPostmanError(error, 'Failed to create folder comment');
        }
    },
});

export const postmanGetFolderComments = tool({
    description:
        'Retrieve all comments left by users in a folder. Use when you need to fetch all comments associated with a specific folder within a collection.',
    inputSchema: z.object({
        ...authField,
        collectionUid: z.string().describe('The collection UID containing the folder'),
        folderUid: z.string().describe('The folder UID to retrieve comments from'),
    }),
    execute: async ({ postmanApiKey, collectionUid, folderUid }) => {
        try {
            if (!postmanApiKey) return missingKey();
            return await postmanRequest(
                postmanApiKey,
                'GET',
                `/collections/${encodeURIComponent(collectionUid)}/folders/${encodeURIComponent(folderUid)}/comments`,
            );
        } catch (error) {
            return toPostmanError(error, 'Failed to get folder comments');
        }
    },
});

export const postmanUpdateAFoldersComment = tool({
    description:
        'Update a comment on a folder. Use when you need to modify the text content of an existing comment on a specific folder in a collection.',
    inputSchema: z.object({
        ...authField,
        collectionUid: z.string().describe('The collection UID containing the folder'),
        folderUid: z.string().describe('The folder UID containing the comment'),
        commentId: commentIdField,
        body: z.string().describe('The updated text content of the comment'),
    }),
    execute: async ({ postmanApiKey, collectionUid, folderUid, commentId, body }) => {
        try {
            if (!postmanApiKey) return missingKey();
            return await postmanRequest(
                postmanApiKey,
                'PUT',
                commentPath(
                    `/collections/${encodeURIComponent(collectionUid)}/folders/${encodeURIComponent(folderUid)}/comments`,
                    commentId,
                ),
                { body: { body } },
            );
        } catch (error) {
            return toPostmanError(error, 'Failed to update folder comment');
        }
    },
});

export const postmanDeleteAFoldersComment = tool({
    description:
        "Delete a comment from a folder. Use when you need to remove a specific comment from a folder. Returns HTTP 204 No Content on successful deletion.",
    inputSchema: z.object({
        ...authField,
        collectionUid: z.string().describe('The collection UID containing the folder'),
        folderUid: z.string().describe('The folder UID containing the comment'),
        commentId: commentIdField,
    }),
    execute: async ({ postmanApiKey, collectionUid, folderUid, commentId }) => {
        try {
            if (!postmanApiKey) return missingKey();
            return await postmanRequest(
                postmanApiKey,
                'DELETE',
                commentPath(
                    `/collections/${encodeURIComponent(collectionUid)}/folders/${encodeURIComponent(folderUid)}/comments`,
                    commentId,
                ),
            );
        } catch (error) {
            return toPostmanError(error, 'Failed to delete folder comment');
        }
    },
});

// ---- Request comments (/collections/{collectionUid}/requests/{requestUid}/comments) ----

export const postmanCreateARequestComment = tool({
    description:
        'Create a comment on a request. Use when you need to add a comment to a specific request within a collection or reply to an existing comment thread.',
    inputSchema: z.object({
        ...authField,
        collectionUid: z.string().describe('The collection UID containing the request'),
        requestUid: z.string().describe('The request UID to create a comment on'),
        body: z.string().describe('The comment text content to post on the request'),
        threadId: threadIdField,
    }),
    execute: async ({ postmanApiKey, collectionUid, requestUid, body, threadId }) => {
        try {
            if (!postmanApiKey) return missingKey();
            return await postmanRequest(
                postmanApiKey,
                'POST',
                `/collections/${encodeURIComponent(collectionUid)}/requests/${encodeURIComponent(requestUid)}/comments`,
                { body: { body, ...(threadId !== undefined ? { threadId } : {}) } },
            );
        } catch (error) {
            return toPostmanError(error, 'Failed to create request comment');
        }
    },
});

export const postmanGetRequestComments = tool({
    description:
        'Retrieve all comments left by users in a request. Use when you need to fetch all comments associated with a specific request within a collection.',
    inputSchema: z.object({
        ...authField,
        collectionUid: z.string().describe('The collection UID containing the request'),
        requestUid: z.string().describe('The request UID to retrieve comments from'),
    }),
    execute: async ({ postmanApiKey, collectionUid, requestUid }) => {
        try {
            if (!postmanApiKey) return missingKey();
            return await postmanRequest(
                postmanApiKey,
                'GET',
                `/collections/${encodeURIComponent(collectionUid)}/requests/${encodeURIComponent(requestUid)}/comments`,
            );
        } catch (error) {
            return toPostmanError(error, 'Failed to get request comments');
        }
    },
});

export const postmanUpdateARequestsComment = tool({
    description:
        "Update a comment on a request. Use when you need to modify the text content of an existing comment on a specific request within a collection.",
    inputSchema: z.object({
        ...authField,
        collectionUid: z.string().describe('The collection UID containing the request'),
        requestUid: z.string().describe('The request UID containing the comment'),
        commentId: commentIdField,
        body: z.string().describe('The updated text content of the comment'),
    }),
    execute: async ({ postmanApiKey, collectionUid, requestUid, commentId, body }) => {
        try {
            if (!postmanApiKey) return missingKey();
            return await postmanRequest(
                postmanApiKey,
                'PUT',
                commentPath(
                    `/collections/${encodeURIComponent(collectionUid)}/requests/${encodeURIComponent(requestUid)}/comments`,
                    commentId,
                ),
                { body: { body } },
            );
        } catch (error) {
            return toPostmanError(error, 'Failed to update request comment');
        }
    },
});

export const postmanDeleteARequestsComment = tool({
    description:
        "Delete a comment from a request. Use when you need to remove a specific comment from a request. On success, returns HTTP 204 No Content.",
    inputSchema: z.object({
        ...authField,
        collectionUid: z.string().describe('The collection UID containing the request'),
        requestUid: z.string().describe('The request UID containing the comment'),
        commentId: commentIdField,
    }),
    execute: async ({ postmanApiKey, collectionUid, requestUid, commentId }) => {
        try {
            if (!postmanApiKey) return missingKey();
            return await postmanRequest(
                postmanApiKey,
                'DELETE',
                commentPath(
                    `/collections/${encodeURIComponent(collectionUid)}/requests/${encodeURIComponent(requestUid)}/comments`,
                    commentId,
                ),
            );
        } catch (error) {
            return toPostmanError(error, 'Failed to delete request comment');
        }
    },
});

// ---- Response comments (/collections/{collectionUid}/responses/{responseUid}/comments) ----

export const postmanCreateAResponseComment = tool({
    description:
        'Create a comment on a response. Use when you need to add a comment to a specific response within a collection or reply to an existing comment thread.',
    inputSchema: z.object({
        ...authField,
        collectionUid: z.string().describe('The collection UID containing the response'),
        responseUid: z.string().describe('The response UID to create a comment on'),
        body: z.string().describe('The comment text content to post on the response'),
        threadId: threadIdField,
    }),
    execute: async ({ postmanApiKey, collectionUid, responseUid, body, threadId }) => {
        try {
            if (!postmanApiKey) return missingKey();
            return await postmanRequest(
                postmanApiKey,
                'POST',
                `/collections/${encodeURIComponent(collectionUid)}/responses/${encodeURIComponent(responseUid)}/comments`,
                { body: { body, ...(threadId !== undefined ? { threadId } : {}) } },
            );
        } catch (error) {
            return toPostmanError(error, 'Failed to create response comment');
        }
    },
});

export const postmanGetResponseComments = tool({
    description:
        'Retrieve all comments left by users in a response. Use when you need to fetch all comments associated with a specific response within a collection.',
    inputSchema: z.object({
        ...authField,
        collectionUid: z.string().describe('The collection UID containing the response'),
        responseUid: z.string().describe('The response UID to retrieve comments from'),
    }),
    execute: async ({ postmanApiKey, collectionUid, responseUid }) => {
        try {
            if (!postmanApiKey) return missingKey();
            return await postmanRequest(
                postmanApiKey,
                'GET',
                `/collections/${encodeURIComponent(collectionUid)}/responses/${encodeURIComponent(responseUid)}/comments`,
            );
        } catch (error) {
            return toPostmanError(error, 'Failed to get response comments');
        }
    },
});

export const postmanUpdateAResponsesComment = tool({
    description:
        "Update a comment on a response. Use when you need to modify the text content of an existing comment on a specific response within a collection.",
    inputSchema: z.object({
        ...authField,
        collectionUid: z.string().describe('The collection UID containing the response'),
        responseUid: z.string().describe('The response UID containing the comment'),
        commentId: commentIdField,
        body: z.string().describe('The updated text content of the comment'),
    }),
    execute: async ({ postmanApiKey, collectionUid, responseUid, commentId, body }) => {
        try {
            if (!postmanApiKey) return missingKey();
            return await postmanRequest(
                postmanApiKey,
                'PUT',
                commentPath(
                    `/collections/${encodeURIComponent(collectionUid)}/responses/${encodeURIComponent(responseUid)}/comments`,
                    commentId,
                ),
                { body: { body } },
            );
        } catch (error) {
            return toPostmanError(error, 'Failed to update response comment');
        }
    },
});

export const postmanDeleteAResponsesComment = tool({
    description:
        'Delete a comment from a response. Use when you need to remove a specific comment from a collection response. On success, returns HTTP 204 No Content.',
    inputSchema: z.object({
        ...authField,
        collectionUid: z.string().describe('The collection UID containing the response'),
        responseUid: z.string().describe('The response UID containing the comment'),
        commentId: commentIdField,
    }),
    execute: async ({ postmanApiKey, collectionUid, responseUid, commentId }) => {
        try {
            if (!postmanApiKey) return missingKey();
            return await postmanRequest(
                postmanApiKey,
                'DELETE',
                commentPath(
                    `/collections/${encodeURIComponent(collectionUid)}/responses/${encodeURIComponent(responseUid)}/comments`,
                    commentId,
                ),
            );
        } catch (error) {
            return toPostmanError(error, 'Failed to delete response comment');
        }
    },
});

// ---- Comment threads ----

export const postmanResolveACommentThread = tool({
    description:
        'Resolve a comment thread and any associated replies. Use when you need to mark a comment thread as resolved. On success, returns HTTP 204 No Content.',
    inputSchema: z.object({
        ...authField,
        threadId: z.union([z.string(), z.number()]).describe('The ID of the comment thread to resolve'),
    }),
    execute: async ({ postmanApiKey, threadId }) => {
        try {
            if (!postmanApiKey) return missingKey();
            return await postmanRequest(postmanApiKey, 'POST', `/comments-resolutions/${encodeURIComponent(String(threadId))}`);
        } catch (error) {
            return toPostmanError(error, 'Failed to resolve comment thread');
        }
    },
});
