// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { youtubeRequest, youtubeTokenField } from './client.js';

export const getVideoRating = tool({
    description:
        'Retrieves the ratings the authorized user gave to the specified videos (like, dislike, none).',
    inputSchema: z.object({
        youtubeToken: youtubeTokenField,
        id: z.string().describe('Comma-separated video IDs to check ratings for'),
        onBehalfOfContentOwner: z.string().optional().describe('Content partner acting on behalf of this owner'),
    }),
    execute: async ({ youtubeToken, id, onBehalfOfContentOwner }) => {
        try {
            const result = await youtubeRequest(youtubeToken, '/videos/getRating', {
                query: { id, onBehalfOfContentOwner },
            });
            if (!result.ok) return { error: 'Failed to get video ratings', details: result.error };
            return result.data;
        } catch (error) {
            return {
                error: 'Error getting video ratings',
                message: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    },
});
