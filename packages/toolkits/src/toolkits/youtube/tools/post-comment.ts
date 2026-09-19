// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { youtubeRequest, youtubeTokenField } from './client.js';

export const postComment = tool({
    description:
        'Posts a new top-level comment on a video. Use to engage with video content.',
    inputSchema: z.object({
        youtubeToken: youtubeTokenField,
        videoId: z.string().describe('Video ID to comment on (required)'),
        channelId: z.string().describe('Channel ID that uploaded the video (required)'),
        textOriginal: z.string().min(1).describe('Comment text to post'),
    }),
    execute: async ({ youtubeToken, videoId, channelId, textOriginal }) => {
        try {
            const result = await youtubeRequest(youtubeToken, '/commentThreads', {
                method: 'POST',
                query: { part: 'snippet' },
                body: {
                    snippet: { videoId, channelId, topLevelComment: { snippet: { textOriginal } } },
                },
            });
            if (!result.ok) return { error: 'Failed to post comment', details: result.error };
            return result.data;
        } catch (error) {
            return {
                error: 'Error posting comment',
                message: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    },
});
