// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { youtubeRequest, youtubeTokenField } from './client.js';

export const listVideoCategories = tool({
    description:
        'Lists video categories for a region or by ID. Either id or regionCode must be set.',
    inputSchema: z.object({
        youtubeToken: youtubeTokenField,
        id: z.string().optional().describe('Comma-separated category IDs'),
        regionCode: z.string().optional().describe("ISO 3166-1 alpha-2 region, e.g. 'US'"),
        part: z.string().optional().describe("Resource parts (default snippet)"),
        hl: z.string().optional().describe('BCP-47 language for text (default en_US)'),
    }),
    execute: async ({ youtubeToken, id, regionCode, part, hl }) => {
        try {
            if (!id && !regionCode) return { error: 'Either id or regionCode must be specified' };
            const result = await youtubeRequest(youtubeToken, '/videoCategories', {
                query: { part: part ?? 'snippet', id, regionCode, hl },
            });
            if (!result.ok) return { error: 'Failed to list video categories', details: result.error };
            return result.data;
        } catch (error) {
            return {
                error: 'Error listing video categories',
                message: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    },
});
