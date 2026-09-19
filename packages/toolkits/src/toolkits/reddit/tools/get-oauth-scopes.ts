// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { redditGet } from './client.js';

export const redditGetOauthScopes = tool({
    description:
        'List all OAuth scopes supported by the Reddit API with their descriptions. Use to understand which permissions are available before requesting broader access.',
    inputSchema: z.object({
        redditToken: z.string().optional().describe('Injected by system; do not provide'),
    }),
    execute: async ({ redditToken }) => {
        try {
            if (!redditToken) {
                return { error: 'Reddit token is required. Connect Reddit first.' };
            }
            return await redditGet(redditToken, '/api/v1/scopes');
        } catch (error) {
            if ((error as any)?.details !== undefined) {
                return { error: 'Failed to get OAuth scopes', details: (error as any).details };
            }
            return {
                error: 'Error getting OAuth scopes',
                message: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    },
});
