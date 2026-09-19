// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { redditGet } from './client.js';

export const redditGetUserAbout = tool({
    description:
        'Get public profile information about a Reddit user, including karma scores and premium status. Use "me" for the authenticated user. Do not include the u/ prefix.',
    inputSchema: z.object({
        redditToken: z.string().optional().describe('Injected by system; do not provide'),
        username: z.string().describe("Reddit username without the 'u/' prefix, or 'me' for the authenticated user"),
    }),
    execute: async ({ redditToken, username }) => {
        try {
            if (!redditToken) {
                return { error: 'Reddit token is required. Connect Reddit first.' };
            }
            return await redditGet(redditToken, `/user/${username}/about`);
        } catch (error) {
            if ((error as any)?.details !== undefined) {
                return { error: 'Failed to get user information', details: (error as any).details };
            }
            return {
                error: 'Error getting user information',
                message: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    },
});
