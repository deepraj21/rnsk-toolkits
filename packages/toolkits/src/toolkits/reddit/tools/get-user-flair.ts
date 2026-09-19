// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { redditGet } from './client.js';

export const redditGetUserFlair = tool({
    description:
        'List user flair assignments for a subreddit with pagination. Returned flair IDs are scoped to that subreddit and must not be reused elsewhere.',
    inputSchema: z.object({
        redditToken: z.string().optional().describe('Injected by system; do not provide'),
        subreddit: z.string().describe("Subreddit name without the 'r/' prefix, e.g. 'pics'"),
        limit: z.number().min(1).max(1000).optional().describe('Max flair entries per page (default 25, max 1000)'),
        after: z.string().optional().describe('User ID anchor for the next page'),
        before: z.string().optional().describe('User ID anchor for the previous page'),
    }),
    execute: async ({ redditToken, subreddit, limit, after, before }) => {
        try {
            if (!redditToken) {
                return { error: 'Reddit token is required. Connect Reddit first.' };
            }
            return await redditGet(redditToken, `/r/${subreddit}/api/flairlist`, { limit, after, before });
        } catch (error) {
            if ((error as any)?.details !== undefined) {
                return { error: 'Failed to get user flair', details: (error as any).details };
            }
            return {
                error: 'Error getting user flair',
                message: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    },
});
