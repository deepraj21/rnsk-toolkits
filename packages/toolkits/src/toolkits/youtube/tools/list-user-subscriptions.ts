// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { youtubeRequest, youtubeTokenField } from './client.js';

export const listUserSubscriptions = tool({
    description:
        'Retrieves the authenticated user channel subscriptions with pagination.',
    inputSchema: z.object({
        youtubeToken: youtubeTokenField,
        part: z.string().optional().describe('Resource parts (default snippet,contentDetails)'),
        maxResults: z.number().min(1).max(50).optional().describe('Subscriptions per page (1-50, default 5)'),
        pageToken: z.string().optional().describe('Page token from a previous response'),
    }),
    execute: async ({ youtubeToken, part, maxResults, pageToken }) => {
        try {
            const result = await youtubeRequest(youtubeToken, '/subscriptions', {
                query: { part: part ?? 'snippet,contentDetails', mine: true, maxResults, pageToken },
            });
            if (!result.ok) return { error: 'Failed to list subscriptions', details: result.error };
            return result.data;
        } catch (error) {
            return {
                error: 'Error listing subscriptions',
                message: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    },
});
