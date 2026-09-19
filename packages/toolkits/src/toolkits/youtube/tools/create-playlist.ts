// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { youtubeRequest, youtubeTokenField } from './client.js';

export const createPlaylist = tool({
    description:
        'Creates a new playlist on the authenticated user channel. Use when organizing videos into collections or building curated playlists.',
    inputSchema: z.object({
        youtubeToken: youtubeTokenField,
        title: z.string().describe('Title of the new playlist (required)'),
        description: z.string().optional().describe('Playlist description'),
        privacyStatus: z.enum(['public', 'private', 'unlisted']).optional().describe('Privacy status; omit for YouTube default'),
    }),
    execute: async ({ youtubeToken, title, description, privacyStatus }) => {
        try {
            const snippet: Record<string, unknown> = { title };
            if (description !== undefined) snippet.description = description;
            const body: Record<string, unknown> = { snippet };
            if (privacyStatus) body.status = { privacyStatus };
            const result = await youtubeRequest(youtubeToken, '/playlists', {
                method: 'POST',
                query: { part: 'snippet,status' },
                body,
            });
            if (!result.ok) return { error: 'Failed to create playlist', details: result.error };
            return result.data;
        } catch (error) {
            return {
                error: 'Error creating playlist',
                message: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    },
});
