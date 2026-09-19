// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { youtubeRequest, youtubeTokenField } from './client.js';

export const updateChannelSection = tool({
    description:
        'Updates a channel section (title, position, featured playlists/channels) by ID.',
    inputSchema: z.object({
        youtubeToken: youtubeTokenField,
        id: z.string().describe('Channel section ID to update (required)'),
        snippet: z.object({
            type: z.string().describe('Section type (required by the API, e.g. multiplePlaylists)'),
            title: z.string().max(100).optional().describe('New title (multiplePlaylists/multipleChannels only)'),
            position: z.number().min(0).optional().describe('New zero-based position'),
            channelId: z.string().optional().describe('Channel that published the section'),
        }).optional(),
        contentDetails: z.object({
            playlists: z.array(z.string()).optional(),
            channels: z.array(z.string()).optional(),
        }).optional(),
    }),
    execute: async ({ youtubeToken, id, snippet, contentDetails }) => {
        try {
            const body: Record<string, unknown> = { id };
            if (snippet) body.snippet = snippet;
            if (contentDetails) body.contentDetails = contentDetails;
            const result = await youtubeRequest(youtubeToken, '/channelSections', {
                method: 'PUT',
                query: { part: 'snippet,contentDetails' },
                body,
            });
            if (!result.ok) return { error: 'Failed to update channel section', details: result.error };
            return result.data;
        } catch (error) {
            return {
                error: 'Error updating channel section',
                message: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    },
});
