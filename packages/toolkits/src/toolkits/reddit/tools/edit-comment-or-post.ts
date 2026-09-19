// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { redditPost, throwIfJsonErrors } from './client.js';

export const redditEditCommentOrPost = tool({
    description:
        'Edit the body text of the authenticated user\'s own comment or self (text) post. Cannot edit link posts or titles. Provide the fullname ID (t1_ for comments, t3_ for posts).',
    inputSchema: z.object({
        redditToken: z.string().optional().describe('Injected by system; do not provide'),
        thingId: z.string().describe("Fullname of the comment or self-post, e.g. 't1_c0c0c0c' or 't3_h0h0h0h'"),
        text: z.string().describe('New raw markdown body text'),
    }),
    execute: async ({ redditToken, thingId, text }) => {
        try {
            if (!redditToken) {
                return { error: 'Reddit token is required. Connect Reddit first.' };
            }
            const data = await redditPost(redditToken, '/api/editusertext', {
                thing_id: thingId,
                text,
            });
            throwIfJsonErrors(data, 'Edit');
            return data;
        } catch (error) {
            if ((error as any)?.details !== undefined) {
                return { error: 'Failed to edit Reddit comment or post', details: (error as any).details };
            }
            return {
                error: 'Error editing Reddit comment or post',
                message: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    },
});
