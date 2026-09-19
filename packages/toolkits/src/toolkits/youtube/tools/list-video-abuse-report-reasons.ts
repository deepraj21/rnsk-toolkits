// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { youtubeRequest, youtubeTokenField } from './client.js';

export const listVideoAbuseReportReasons = tool({
    description:
        'Lists abuse report reasons with localized labels for use with reportVideoAbuse.',
    inputSchema: z.object({
        youtubeToken: youtubeTokenField,
        part: z.string().optional().describe("Resource parts: 'id' and/or 'snippet' (default snippet)"),
        hl: z.string().optional().describe('BCP-47 language for labels (default en_US)'),
    }),
    execute: async ({ youtubeToken, part, hl }) => {
        try {
            const result = await youtubeRequest(youtubeToken, '/videoAbuseReportReasons', {
                query: { part: part ?? 'snippet', hl },
            });
            if (!result.ok) return { error: 'Failed to list abuse report reasons', details: result.error };
            return result.data;
        } catch (error) {
            return {
                error: 'Error listing abuse report reasons',
                message: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    },
});
