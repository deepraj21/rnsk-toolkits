// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { redditPost } from './client.js';

export const redditDeletePost = tool({
    description:
        'Permanently delete a post authored by the authenticated user. Provide the post fullname ID (starts with t3_). Only works on the own posts — confirm with the user first.',
    inputSchema: z.object({
        redditToken: z.string().optional().describe('Injected by system; do not provide'),
        id: z.string().describe("Post fullname ID, e.g. 't3_1abcdef'"),
    }),
    execute: async ({ redditToken, id }) => {
        try {
            if (!redditToken) {
                return { error: 'Reddit token is required. Connect Reddit first.' };
            }
            await redditPost(redditToken, '/api/del', { id });
            return { success: true, id };
        } catch (error) {
            if ((error as any)?.details !== undefined) {
                return { error: 'Failed to delete Reddit post', details: (error as any).details };
            }
            return {
                error: 'Error deleting Reddit post',
                message: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    },
});
