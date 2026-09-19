// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { youtubeRequest, youtubeTokenField } from './client.js';

export const listPlaylistImages = tool({
    description:
        'Retrieves custom thumbnail images for a playlist. Specify either image IDs or the parent playlist ID.',
    inputSchema: z.object({
        youtubeToken: youtubeTokenField,
        id: z.string().optional().describe('Comma-separated playlist image IDs'),
        parent: z.string().optional().describe('Playlist ID to retrieve images for'),
        part: z.string().optional().describe('Resource parts (default snippet)'),
        maxResults: z.number().min(0).max(50).optional().describe('Images per page (0-50, default 5)'),
        pageToken: z.string().optional().describe('Page token from a previous response'),
        onBehalfOfContentOwner: z.string().optional(),
        onBehalfOfContentOwnerChannel: z.string().optional(),
    }),
    execute: async ({ youtubeToken, id, parent, part, maxResults, pageToken, onBehalfOfContentOwner, onBehalfOfContentOwnerChannel }) => {
        try {
            if (!id && !parent) return { error: 'Either id or parent must be provided' };
            const result = await youtubeRequest(youtubeToken, '/playlistImages', {
                query: { part: part ?? 'snippet', id, parent, maxResults, pageToken, onBehalfOfContentOwner, onBehalfOfContentOwnerChannel },
            });
            if (!result.ok) return { error: 'Failed to list playlist images', details: result.error };
            return result.data;
        } catch (error) {
            return {
                error: 'Error listing playlist images',
                message: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    },
});
