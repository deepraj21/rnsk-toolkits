// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { youtubeRequest, youtubeTokenField } from './client.js';

export const listUserPlaylists = tool({
    description:
        'Retrieves playlists owned by the authenticated user (mine=true). Use to discover playlist IDs before managing items.',
    inputSchema: z.object({
        youtubeToken: youtubeTokenField,
        part: z.string().optional().describe('Resource parts (default snippet)'),
        maxResults: z.number().min(1).max(50).optional().describe('Playlists per page (1-50, default 5)'),
        pageToken: z.string().optional().describe('Page token from a previous response'),
    }),
    execute: async ({ youtubeToken, part, maxResults, pageToken }) => {
        try {
            const result = await youtubeRequest(youtubeToken, '/playlists', {
                query: { part: part ?? 'snippet', mine: true, maxResults, pageToken },
            });
            if (!result.ok) return { error: 'Failed to list user playlists', details: result.error };
            return result.data;
        } catch (error) {
            return {
                error: 'Error listing user playlists',
                message: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    },
});
