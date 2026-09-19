// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { youtubeRequest, youtubeTokenField } from './client.js';

export const listCaptionTrack = tool({
    description:
        'Lists caption tracks for a video. Returns an empty items list when none exist. Use track IDs from here with downloadCaptionTrack.',
    inputSchema: z.object({
        youtubeToken: youtubeTokenField,
        videoId: z.string().describe('Video ID to list caption tracks for (required)'),
        part: z.string().optional().describe("Resource parts: 'id' and/or 'snippet' (default snippet)"),
    }),
    execute: async ({ youtubeToken, videoId, part }) => {
        try {
            const result = await youtubeRequest(youtubeToken, '/captions', {
                query: { part: part ?? 'snippet', videoId },
            });
            if (!result.ok) return { error: 'Failed to list caption tracks', details: result.error };
            return result.data;
        } catch (error) {
            return {
                error: 'Error listing caption tracks',
                message: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    },
});
