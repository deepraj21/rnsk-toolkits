// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { redditPost, throwIfJsonErrors } from './client.js';

export const redditPostComment = tool({
    description:
        'Post a comment replying to a submission (t3_ ID) or another comment (t1_ ID). Publishes immediately and publicly — confirm target and text first. Fails on locked or archived threads; honor any RATELIMIT cooldown before retrying.',
    inputSchema: z.object({
        redditToken: z.string().optional().describe('Injected by system; do not provide'),
        thingId: z.string().describe("Parent post (t3_) or comment (t1_) fullname ID, e.g. 't3_10omtdx'"),
        text: z.string().describe('Raw markdown text of the comment'),
    }),
    execute: async ({ redditToken, thingId, text }) => {
        try {
            if (!redditToken) {
                return { error: 'Reddit token is required. Connect Reddit first.' };
            }
            const data = await redditPost(redditToken, '/api/comment', {
                thing_id: thingId,
                text,
            });
            throwIfJsonErrors(data, 'Post comment');
            return data;
        } catch (error) {
            if ((error as any)?.details !== undefined) {
                return { error: 'Failed to post Reddit comment', details: (error as any).details };
            }
            return {
                error: 'Error posting Reddit comment',
                message: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    },
});
