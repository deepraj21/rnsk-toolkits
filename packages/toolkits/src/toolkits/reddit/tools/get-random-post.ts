// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { redditGet } from './client.js';

export const redditGetRandomPost = tool({
    description:
        'Get a random public Reddit post, optionally limited to a specific subreddit. Use to discover serendipitous content.',
    inputSchema: z.object({
        redditToken: z.string().optional().describe('Injected by system; do not provide'),
        subreddit: z
            .string()
            .optional()
            .describe("Subreddit name without the 'r/' prefix. Omit for a random post from all of Reddit"),
    }),
    execute: async ({ redditToken, subreddit }) => {
        try {
            if (!redditToken) {
                return { error: 'Reddit token is required. Connect Reddit first.' };
            }
            return await redditGet(redditToken, subreddit ? `/r/${subreddit}/random` : '/random');
        } catch (error) {
            if ((error as any)?.details !== undefined) {
                return { error: 'Failed to get random post', details: (error as any).details };
            }
            return {
                error: 'Error getting random post',
                message: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    },
});
