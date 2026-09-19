// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { redditGet } from './client.js';

export const redditRetrievePostComments = tool({
    description:
        'Get comments for a post by its base-36 article ID (without the t3_ prefix). The response is a two-element array: post metadata first, then comments with nested replies under each comment\'s replies field. Filter out bodies that are [deleted] or [removed].',
    inputSchema: z.object({
        redditToken: z.string().optional().describe('Injected by system; do not provide'),
        article: z.string().describe("Base-36 post ID without the 't3_' prefix, e.g. 'q5u7q5'"),
        sort: z
            .enum(['confidence', 'top', 'new', 'controversial', 'old', 'random', 'qa', 'live'])
            .optional()
            .describe('Comment sort order'),
        limit: z.number().min(1).optional().describe('Max comments to return'),
        depth: z.number().min(0).optional().describe('Max nesting depth of the reply tree'),
    }),
    execute: async ({ redditToken, article, sort, limit, depth }) => {
        try {
            if (!redditToken) {
                return { error: 'Reddit token is required. Connect Reddit first.' };
            }
            const data = await redditGet(redditToken, `/comments/${article}`, { sort, limit, depth });
            if (!Array.isArray(data) || data.length < 2) {
                return data;
            }
            return { postListing: data[0], commentsListing: data[1] };
        } catch (error) {
            if ((error as any)?.details !== undefined) {
                return { error: 'Failed to retrieve post comments', details: (error as any).details };
            }
            return {
                error: 'Error retrieving post comments',
                message: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    },
});
