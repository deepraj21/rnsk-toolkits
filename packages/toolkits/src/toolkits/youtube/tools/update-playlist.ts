// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { onBehalfOfContentOwnerField, youtubeRequest, youtubeTokenField } from './client.js';

export const updatePlaylist = tool({
    description:
        "Modifies a playlist's metadata (title, description, privacy status) on the authenticated user channel.",
    inputSchema: z.object({
        youtubeToken: youtubeTokenField,
        id: z.string().describe('Playlist ID to update'),
        snippet: z.object({
            title: z.string().describe('New playlist title (required)'),
            description: z.string().optional().describe('New playlist description'),
            defaultLanguage: z.string().optional().describe('BCP-47 language code'),
        }),
        status: z.object({
            privacyStatus: z.enum(['public', 'private', 'unlisted']).optional(),
            podcastStatus: z.string().optional(),
        }).optional().describe('Privacy/podcast status update'),
        part: z.string().optional().describe('Response parts (default snippet,status)'),
        onBehalfOfContentOwner: onBehalfOfContentOwnerField,
    }),
    execute: async ({ youtubeToken, id, snippet, status, part, onBehalfOfContentOwner }) => {
        try {
            const body: Record<string, unknown> = { id, snippet };
            if (status) body.status = status;
            const result = await youtubeRequest(youtubeToken, '/playlists', {
                method: 'PUT',
                query: { part: part ?? 'snippet,status', onBehalfOfContentOwner },
                body,
            });
            if (!result.ok) return { error: 'Failed to update playlist', details: result.error };
            return result.data;
        } catch (error) {
            return {
                error: 'Error updating playlist',
                message: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    },
});
