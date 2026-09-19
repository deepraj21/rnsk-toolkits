// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { redditGet } from './client.js';

export const redditRetrieveSpecificCommentOrPost = tool({
    description:
        'Get detailed information for a single comment or post by its fullname ID. Returns only that item without surrounding thread context — use redditRetrievePostComments for full discussions. Deleted or removed items may return empty payloads.',
    inputSchema: z.object({
        redditToken: z.string().optional().describe('Injected by system; do not provide'),
        id: z
            .string()
            .describe("Fullname ID with type prefix (t1_ for comments, t3_ for posts), e.g. 't1_abc123'"),
    }),
    execute: async ({ redditToken, id }) => {
        try {
            if (!redditToken) {
                return { error: 'Reddit token is required. Connect Reddit first.' };
            }
            const data = await redditGet(redditToken, '/api/info', { id });
            return { things: data?.data?.children ?? [] };
        } catch (error) {
            if ((error as any)?.details !== undefined) {
                return { error: 'Failed to retrieve comment or post', details: (error as any).details };
            }
            return {
                error: 'Error retrieving comment or post',
                message: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    },
});
