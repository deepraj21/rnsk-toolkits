// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { onBehalfOfContentOwnerField, youtubeRequest, youtubeTokenField } from './client.js';

export const listChannelSections = tool({
    description:
        "Retrieves a channel homepage's layout sections. Exactly one of channelId, id, or mine must be set.",
    inputSchema: z.object({
        youtubeToken: youtubeTokenField,
        part: z.string().describe("Resource parts, e.g. 'snippet' or 'snippet,contentDetails' (required)"),
        channelId: z.string().optional().describe('Channel ID to list sections for'),
        id: z.string().optional().describe('Comma-separated channel section IDs'),
        mine: z.boolean().optional().describe('True for the authenticated user channel'),
        hl: z.string().optional().describe('Deprecated language hint for localized metadata'),
        onBehalfOfContentOwner: onBehalfOfContentOwnerField,
    }),
    execute: async ({ youtubeToken, part, channelId, id, mine, hl, onBehalfOfContentOwner }) => {
        try {
            const filters = [channelId, id, mine === true ? 'mine' : undefined].filter(Boolean);
            if (filters.length !== 1) return { error: 'Exactly one of channelId, id, or mine must be provided' };
            const result = await youtubeRequest(youtubeToken, '/channelSections', {
                query: { part, channelId, id, mine, hl, onBehalfOfContentOwner },
            });
            if (!result.ok) return { error: 'Failed to list channel sections', details: result.error };
            return result.data;
        } catch (error) {
            return {
                error: 'Error listing channel sections',
                message: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    },
});
