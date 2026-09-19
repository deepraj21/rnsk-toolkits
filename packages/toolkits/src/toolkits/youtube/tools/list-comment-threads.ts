// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { youtubeRequest, youtubeTokenField } from './client.js';

export const listCommentThreads = tool({
    description:
        'Retrieves comment threads for a video, channel, or thread IDs, with top-level comments plus up to 5 replies each. Prefer videoId for video comments.',
    inputSchema: z.object({
        youtubeToken: youtubeTokenField,
        part: z.string().describe("Resource parts (required), e.g. 'snippet,replies'"),
        videoId: z.string().optional().describe('Video ID for its comment threads (most common)'),
        channelId: z.string().optional().describe('Channel ID for comments about the channel itself'),
        allThreadsRelatedToChannelId: z.string().optional().describe('Channel ID for all related threads (requires OAuth)'),
        id: z.string().optional().describe('Comma-separated thread IDs'),
        order: z.enum(['time', 'relevance']).optional().describe('Sort order (default time)'),
        searchTerms: z.string().optional().describe('Filter query (only with allThreadsRelatedToChannelId)'),
        moderationStatus: z.enum(['heldForReview', 'likelySpam', 'published']).optional().describe('Filter by status (channel owner only)'),
        textFormat: z.enum(['html', 'plainText']).optional(),
        maxResults: z.number().min(1).max(100).optional().describe('Threads per page (1-100)'),
        pageToken: z.string().optional().describe('Page token from a previous response'),
    }),
    execute: async ({ youtubeToken, part, videoId, channelId, allThreadsRelatedToChannelId, id, order, searchTerms, moderationStatus, textFormat, maxResults, pageToken }) => {
        try {
            const result = await youtubeRequest(youtubeToken, '/commentThreads', {
                query: { part, videoId, channelId, allThreadsRelatedToChannelId, id, order, searchTerms, moderationStatus, textFormat, maxResults, pageToken },
            });
            if (!result.ok) return { error: 'Failed to list comment threads', details: result.error };
            return result.data;
        } catch (error) {
            return {
                error: 'Error listing comment threads',
                message: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    },
});
