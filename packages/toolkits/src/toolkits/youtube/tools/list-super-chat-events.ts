// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { youtubeRequest, youtubeTokenField } from './client.js';

export const listSuperChatEvents = tool({
    description:
        'Lists Super Chat and Super Sticker purchases from the past 30 days. Use to track and acknowledge supporter contributions.',
    inputSchema: z.object({
        youtubeToken: youtubeTokenField,
        part: z.string().optional().describe("Resource parts: 'id' and/or 'snippet' (default snippet)"),
        maxResults: z.number().min(1).max(50).optional().describe('Events per page (1-50, default 5)'),
        pageToken: z.string().optional().describe('Page token from a previous response'),
        hl: z.string().optional().describe('BCP-47 language for amount display (default en)'),
    }),
    execute: async ({ youtubeToken, part, maxResults, pageToken, hl }) => {
        try {
            const result = await youtubeRequest(youtubeToken, '/superChatEvents', {
                query: { part: part ?? 'snippet', maxResults, pageToken, hl },
            });
            if (!result.ok) return { error: 'Failed to list Super Chat events', details: result.error };
            return result.data;
        } catch (error) {
            return {
                error: 'Error listing Super Chat events',
                message: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    },
});
