// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { redditPost } from './client.js';

export const redditDeleteComment = tool({
    description:
        'Permanently delete a comment authored by the authenticated user. Provide the comment fullname ID (starts with t1_). Deletion is irreversible — confirm with the user first.',
    inputSchema: z.object({
        redditToken: z.string().optional().describe('Injected by system; do not provide'),
        id: z.string().describe("Comment fullname ID, e.g. 't1_c0s4w1c'"),
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
                return { error: 'Failed to delete Reddit comment', details: (error as any).details };
            }
            return {
                error: 'Error deleting Reddit comment',
                message: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    },
});
