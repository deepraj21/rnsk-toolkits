// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { redditGet } from './client.js';

export const redditGetUserPrefs = tool({
    description:
        'Get preference settings of the authenticated Reddit user. Optionally pass a comma-separated list of fields (e.g. lang,over_18,nightmode) to return only those; omit to return all preferences.',
    inputSchema: z.object({
        redditToken: z.string().optional().describe('Injected by system; do not provide'),
        fields: z
            .string()
            .optional()
            .describe('Comma-separated preference fields to return, e.g. lang,theme_selector,nightmode'),
    }),
    execute: async ({ redditToken, fields }) => {
        try {
            if (!redditToken) {
                return { error: 'Reddit token is required. Connect Reddit first.' };
            }
            return await redditGet(redditToken, '/api/v1/me/prefs', { fields });
        } catch (error) {
            if ((error as any)?.details !== undefined) {
                return { error: 'Failed to get user preferences', details: (error as any).details };
            }
            return {
                error: 'Error getting user preferences',
                message: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    },
});
