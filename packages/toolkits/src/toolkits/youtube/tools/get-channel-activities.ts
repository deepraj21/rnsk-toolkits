// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { youtubeRequest, youtubeTokenField } from './client.js';

export const getChannelActivities = tool({
    description:
        'Gets recent channel activities (uploads, playlist additions, likes, and other events) for a channel ID.',
    inputSchema: z.object({
        youtubeToken: youtubeTokenField,
        channelId: z.string().describe("Channel ID (starts with 'UC')"),
        part: z.string().optional().describe('Resource parts (default snippet,contentDetails)'),
        maxResults: z.number().min(0).max(50).optional().describe('Activities to return (0-50, default 25)'),
        pageToken: z.string().optional().describe('Page token from a previous response'),
        publishedAfter: z.string().optional().describe('RFC 3339 lower bound on activity time'),
        publishedBefore: z.string().optional().describe('RFC 3339 upper bound on activity time'),
    }),
    execute: async ({ youtubeToken, channelId, part, maxResults, pageToken, publishedAfter, publishedBefore }) => {
        try {
            const result = await youtubeRequest(youtubeToken, '/activities', {
                query: { part: part ?? 'snippet,contentDetails', channelId, maxResults, pageToken, publishedAfter, publishedBefore },
            });
            if (!result.ok) return { error: 'Failed to get channel activities', details: result.error };
            return result.data;
        } catch (error) {
            return {
                error: 'Error getting channel activities',
                message: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    },
});
