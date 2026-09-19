// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { redditGet } from './client.js';

export const redditCheckUsernameAvailable = tool({
    description:
        'Check whether a username is available for registration on Reddit. Use before suggesting a new account name.',
    inputSchema: z.object({
        redditToken: z.string().optional().describe('Injected by system; do not provide'),
        username: z.string().describe('Username to check (3-20 characters)'),
    }),
    execute: async ({ redditToken, username }) => {
        try {
            if (!redditToken) {
                return { error: 'Reddit token is required. Connect Reddit first.' };
            }
            const available = await redditGet(redditToken, '/api/username_available', { user: username });
            return { username, available: available === true };
        } catch (error) {
            if ((error as any)?.details !== undefined) {
                return { error: 'Failed to check username availability', details: (error as any).details };
            }
            return {
                error: 'Error checking username availability',
                message: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    },
});
