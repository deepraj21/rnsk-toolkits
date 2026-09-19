// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { youtubeRequest, youtubeTokenField } from './client.js';

export const listI18nRegions = tool({
    description:
        'Lists content regions (ISO 3166-1 alpha-2 codes with localized names) that YouTube supports. Use for geo filtering and display.',
    inputSchema: z.object({
        youtubeToken: youtubeTokenField,
        part: z.string().optional().describe("Resource parts (default snippet)"),
        hl: z.string().optional().describe('BCP-47 language for region names (default en_US)'),
    }),
    execute: async ({ youtubeToken, part, hl }) => {
        try {
            const result = await youtubeRequest(youtubeToken, '/i18nRegions', {
                query: { part: part ?? 'snippet', hl },
            });
            if (!result.ok) return { error: 'Failed to list i18n regions', details: result.error };
            return result.data;
        } catch (error) {
            return {
                error: 'Error listing i18n regions',
                message: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    },
});
