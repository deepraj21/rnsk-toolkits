// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { youtubeRequest, youtubeTokenField } from './client.js';

export const rateVideo = tool({
    description:
        'Likes, dislikes, or removes the rating on a video on behalf of the authenticated user.',
    inputSchema: z.object({
        youtubeToken: youtubeTokenField,
        id: z.string().describe('Video ID to rate'),
        rating: z.enum(['like', 'dislike', 'none']).describe('Rating to apply; none removes any existing rating'),
    }),
    execute: async ({ youtubeToken, id, rating }) => {
        try {
            const result = await youtubeRequest(youtubeToken, '/videos/rate', {
                method: 'POST',
                query: { id, rating },
            });
            if (!result.ok) return { error: 'Failed to rate video', details: result.error };
            return { videoId: id, rating, success: true, httpStatus: 204 };
        } catch (error) {
            return {
                error: 'Error rating video',
                message: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    },
});
