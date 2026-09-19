// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { youtubeRequest, youtubeTokenField } from './client.js';

export const searchYouTube = tool({
    description:
        'Searches YouTube for videos, channels, or playlists by query (supports exact phrases, exclusions, OR, @handles). Returns the raw search response.',
    inputSchema: z.object({
        youtubeToken: youtubeTokenField,
        q: z.string().describe('Search query term'),
        part: z.string().optional().describe("Response parts; only 'snippet' is valid for search (default snippet)"),
        type: z.string().optional().describe("Restrict to 'video', 'channel', 'playlist' (comma-separated, default video)"),
        order: z.enum(['date', 'rating', 'relevance', 'title', 'videoCount', 'viewCount']).optional(),
        maxResults: z.number().min(1).max(50).optional().describe('Results per page (1-50, default 5)'),
        pageToken: z.string().optional().describe('Page token from a previous response'),
        regionCode: z.string().optional().describe('ISO 3166-1 alpha-2 country code'),
        publishedAfter: z.string().optional().describe('RFC 3339 lower bound'),
        publishedBefore: z.string().optional().describe('RFC 3339 upper bound'),
        relevanceLanguage: z.string().optional().describe('ISO 639-1 language code'),
    }),
    execute: async ({ youtubeToken, q, part, type, order, maxResults, pageToken, regionCode, publishedAfter, publishedBefore, relevanceLanguage }) => {
        try {
            const result = await youtubeRequest(youtubeToken, '/search', {
                query: { part: part ?? 'snippet', q, type: type ?? 'video', order, maxResults, pageToken, regionCode, publishedAfter, publishedBefore, relevanceLanguage },
            });
            if (!result.ok) return { error: 'Failed to search YouTube', details: result.error };
            return result.data;
        } catch (error) {
            return {
                error: 'Error searching YouTube',
                message: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    },
});
