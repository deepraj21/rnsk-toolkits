// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { youtubeRequest, youtubeTokenField } from './client.js';

export const listChannels = tool({
    description:
        'Lists channels by ID, handle, username, or ownership with metadata, statistics, and content details. For keyword search use searchYouTube instead.',
    inputSchema: z.object({
        youtubeToken: youtubeTokenField,
        part: z.string().optional().describe('Resource parts (default snippet,contentDetails,statistics)'),
        id: z.string().optional().describe('Comma-separated channel IDs (start with UC)'),
        forHandle: z.string().optional().describe('Channel handle, @ optional'),
        forUsername: z.string().optional().describe('Legacy username'),
        mine: z.boolean().optional().describe('True for channels owned by the authenticated user'),
        managedByMe: z.boolean().optional().describe('True for partner-managed channels'),
        hl: z.string().optional().describe('BCP-47 language for localized metadata'),
        maxResults: z.number().min(0).max(50).optional().describe('Results per page (0-50)'),
        pageToken: z.string().optional().describe('Page token from a previous response'),
        onBehalfOfContentOwner: z.string().optional(),
    }),
    execute: async ({ youtubeToken, part, id, forHandle, forUsername, mine, managedByMe, hl, maxResults, pageToken, onBehalfOfContentOwner }) => {
        try {
            if (!id && !forHandle && !forUsername && !mine && !managedByMe) {
                return { error: 'At least one filter (id, forHandle, forUsername, mine, managedByMe) is required' };
            }
            const result = await youtubeRequest(youtubeToken, '/channels', {
                query: { part: part ?? 'snippet,contentDetails,statistics', id, forHandle, forUsername, mine, managedByMe, hl, maxResults, pageToken, onBehalfOfContentOwner },
            });
            if (!result.ok) return { error: 'Failed to list channels', details: result.error };
            return result.data;
        } catch (error) {
            return {
                error: 'Error listing channels',
                message: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    },
});
