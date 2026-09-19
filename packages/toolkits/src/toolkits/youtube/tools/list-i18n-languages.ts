// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { youtubeRequest, youtubeTokenField } from './client.js';

export const listI18nLanguages = tool({
    description:
        'Lists application languages the YouTube website supports. Use for interface localization options.',
    inputSchema: z.object({
        youtubeToken: youtubeTokenField,
        part: z.string().optional().describe("Resource parts (default snippet)"),
        hl: z.string().optional().describe('BCP-47 language for language names (default en_US)'),
    }),
    execute: async ({ youtubeToken, part, hl }) => {
        try {
            const result = await youtubeRequest(youtubeToken, '/i18nLanguages', {
                query: { part: part ?? 'snippet', hl },
            });
            if (!result.ok) return { error: 'Failed to list i18n languages', details: result.error };
            return result.data;
        } catch (error) {
            return {
                error: 'Error listing i18n languages',
                message: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    },
});
