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

export const postmanGetCollectionPullRequests = tool({
    description:
        "Get information about a collection's pull requests including source and destination IDs, status, and URLs. Use when you need to retrieve pull request details for a specific collection.",
    inputSchema: z.object({
        ...authField,
        collectionUid: z.string().describe('The collection UID (owner-collectionId format) to retrieve pull requests from'),
    }),
    execute: async ({ postmanApiKey, collectionUid }) => {
        try {
            if (!postmanApiKey) return missingKey();
            return await postmanRequest(postmanApiKey, 'GET', `/collections/${encodeURIComponent(collectionUid)}/pull-requests`);
        } catch (error) {
            return toPostmanError(error, 'Failed to get collection pull requests');
        }
    },
});

export const postmanCreateAPullRequest = tool({
    description:
        'Create a pull request for a forked collection into its parent collection. Use when you need to propose changes from a forked collection to be merged into the parent collection. The forked collection must exist before creating a pull request.',
    inputSchema: z.object({
        ...authField,
        collectionUid: z.string().describe('The UID of the forked collection (source) to create the pull request from, e.g. owner-collectionId'),
        title: z.string().describe('The title of the pull request. This should summarize the changes being proposed'),
        destinationId: z.string().describe('The UID of the destination (parent) collection where the changes will be merged'),
        description: z.string().optional().describe('A detailed description of the changes in the pull request for reviewers'),
        reviewers: z
            .array(z.string())
            .optional()
            .describe('Array of reviewer user IDs or user groups who should review the pull request. Can be empty'),
    }),
    execute: async ({ postmanApiKey, collectionUid, title, destinationId, description, reviewers }) => {
        try {
            if (!postmanApiKey) return missingKey();
            return await postmanRequest(postmanApiKey, 'POST', `/collections/${encodeURIComponent(collectionUid)}/pull-requests`, {
                body: {
                    title,
                    ...(description !== undefined ? { description } : {}),
                    reviewers: reviewers ?? [],
                    destinationId,
                },
            });
        } catch (error) {
            return toPostmanError(error, 'Failed to create pull request');
        }
    },
});

export const postmanUpdateAPullRequest = tool({
    description:
        'Update an open pull request in Postman. Use when you need to modify the title, description, or reviewers of an existing pull request.',
    inputSchema: z.object({
        ...authField,
        pullRequestId: z.string().describe('The unique identifier of the pull request to update'),
        title: z.string().describe('The updated title of the pull request'),
        description: z.string().optional().describe('The updated description for the pull request'),
        reviewers: z.array(z.string()).optional().describe('Updated array of reviewer user IDs for the pull request'),
    }),
    execute: async ({ postmanApiKey, pullRequestId, title, description, reviewers }) => {
        try {
            if (!postmanApiKey) return missingKey();
            return await postmanRequest(postmanApiKey, 'PUT', `/pull-requests/${encodeURIComponent(pullRequestId)}`, {
                body: {
                    title,
                    ...(description !== undefined ? { description } : {}),
                    ...(reviewers !== undefined ? { reviewers } : {}),
                },
            });
        } catch (error) {
            return toPostmanError(error, 'Failed to update pull request');
        }
    },
});

export const postmanReviewAPullRequest = tool({
    description:
        'Update the review status of a pull request by approving, declining, merging, or unapproving it. Use when you need to perform a review action on a Postman pull request.',
    inputSchema: z.object({
        ...authField,
        pullRequestId: z.string().describe('The unique identifier of the pull request to review'),
        action: z
            .enum(['approve', 'decline', 'merge', 'unapprove'])
            .describe("The review action: 'approve' to approve, 'decline' to decline, 'merge' to merge, 'unapprove' to revoke approval"),
        comment: z.string().optional().describe('Optional comment to attach to the review action'),
    }),
    execute: async ({ postmanApiKey, pullRequestId, action, comment }) => {
        try {
            if (!postmanApiKey) return missingKey();
            return await postmanRequest(postmanApiKey, 'POST', `/pull-requests/${encodeURIComponent(pullRequestId)}/tasks`, {
                body: { action, ...(comment !== undefined ? { comment } : {}) },
            });
        } catch (error) {
            return toPostmanError(error, 'Failed to review pull request');
        }
    },
});
