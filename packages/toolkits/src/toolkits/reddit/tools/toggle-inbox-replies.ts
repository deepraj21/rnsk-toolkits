// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { redditPost } from './client.js';

export const redditToggleInboxReplies = tool({
    description:
        'Enable or disable inbox reply notifications for your own submission or comment. Provide the item fullname ID (t3_ for posts, t1_ for comments) and the desired state.',
    inputSchema: z.object({
        redditToken: z.string().optional().describe('Injected by system; do not provide'),
        id: z.string().describe("Fullname of your post or comment, e.g. 't3_abc123' or 't1_def456'"),
        state: z.boolean().describe('True to receive inbox replies, false to mute them'),
    }),
    execute: async ({ redditToken, id, state }) => {
        try {
            if (!redditToken) {
                return { error: 'Reddit token is required. Connect Reddit first.' };
            }
            await redditPost(redditToken, '/api/sendreplies', { id, state });
            return { success: true, id, state };
        } catch (error) {
            if ((error as any)?.details !== undefined) {
                return { error: 'Failed to toggle inbox replies', details: (error as any).details };
            }
            return {
                error: 'Error toggling inbox replies',
                message: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    },
});
