// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { youtubeRequest, youtubeTokenField } from './client.js';

const sectionType = z.enum(['allPlaylists', 'completedEvents', 'liveEvents', 'multipleChannels', 'multiplePlaylists', 'popularUploads', 'recentUploads', 'singlePlaylist', 'subscriptions', 'upcomingEvents']);

export const createChannelSection = tool({
    description:
        'Creates a channel section (featured playlists, recent uploads, featured channels) on the authenticated user channel.',
    inputSchema: z.object({
        youtubeToken: youtubeTokenField,
        snippet: z.object({
            type: sectionType.describe('Section type (required)'),
            title: z.string().max(100).optional().describe('Title; only for multiplePlaylists/multipleChannels, no angle brackets'),
            position: z.number().min(0).optional().describe('Zero-based position; omit to append'),
        }),
        contentDetails: z.object({
            playlists: z.array(z.string()).optional().describe('Playlist IDs (exactly one for singlePlaylist)'),
            channels: z.array(z.string()).optional().describe('Channel IDs for multipleChannels (not your own)'),
        }).optional(),
    }),
    execute: async ({ youtubeToken, snippet, contentDetails }) => {
        try {
            const body: Record<string, unknown> = { snippet };
            if (contentDetails) body.contentDetails = contentDetails;
            const result = await youtubeRequest(youtubeToken, '/channelSections', {
                method: 'POST',
                query: { part: 'snippet,contentDetails' },
                body,
            });
            if (!result.ok) return { error: 'Failed to create channel section', details: result.error };
            return result.data;
        } catch (error) {
            return {
                error: 'Error creating channel section',
                message: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    },
});
