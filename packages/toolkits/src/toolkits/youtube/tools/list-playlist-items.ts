// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { onBehalfOfContentOwnerField, youtubeRequest, youtubeTokenField } from './client.js';

export const listPlaylistItems = tool({
    description:
        'Lists videos in a playlist with pagination. Use when walking an uploads playlist (UU... IDs) to enumerate all videos.',
    inputSchema: z.object({
        youtubeToken: youtubeTokenField,
        playlistId: z.string().describe("Playlist ID (PL... for playlists, UU... for channel uploads; do not pass UC... channel IDs)"),
        part: z.string().optional().describe('Resource parts (default snippet,contentDetails)'),
        maxResults: z.number().min(0).max(50).optional().describe('Items per page (0-50, default 50)'),
        pageToken: z.string().optional().describe('Page token from a previous response'),
        videoId: z.string().optional().describe('Filter to items containing this video ID'),
        fields: z.string().optional().describe('Partial-response field selector'),
        onBehalfOfContentOwner: onBehalfOfContentOwnerField,
    }),
    execute: async ({ youtubeToken, playlistId, part, maxResults, pageToken, videoId, fields, onBehalfOfContentOwner }) => {
        try {
            const result = await youtubeRequest(youtubeToken, '/playlistItems', {
                query: { part: part ?? 'snippet,contentDetails', playlistId, maxResults, pageToken, videoId, fields, onBehalfOfContentOwner },
            });
            if (!result.ok) return { error: 'Failed to list playlist items', details: result.error };
            return result.data;
        } catch (error) {
            return {
                error: 'Error listing playlist items',
                message: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    },
});
