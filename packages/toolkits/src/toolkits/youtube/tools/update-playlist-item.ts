// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { onBehalfOfContentOwnerField, youtubeRequest, youtubeTokenField } from './client.js';

export const updatePlaylistItem = tool({
    description:
        'Modifies a playlist item (position for reordering, note, privacy). The playlist must use manual sorting to change positions.',
    inputSchema: z.object({
        youtubeToken: youtubeTokenField,
        id: z.string().describe('Playlist item ID to update'),
        snippet: z.object({
            playlistId: z.string().describe('Playlist containing the item (required)'),
            resourceId: z.object({
                kind: z.string().describe("Resource type, e.g. 'youtube#video'"),
                videoId: z.string().describe('Video ID in the playlist'),
            }),
            position: z.number().min(0).optional().describe('New zero-based position; omit to keep current'),
        }),
        contentDetails: z.record(z.any()).optional().describe('Updatable content details, e.g. {note} (max 280 chars)'),
        status: z.object({ privacyStatus: z.string() }).optional().describe('Privacy status update'),
        part: z.string().optional().describe('Response parts (default snippet)'),
        onBehalfOfContentOwner: onBehalfOfContentOwnerField,
    }),
    execute: async ({ youtubeToken, id, snippet, contentDetails, status, part, onBehalfOfContentOwner }) => {
        try {
            const body: Record<string, unknown> = { id, snippet };
            if (contentDetails) body.contentDetails = contentDetails;
            if (status) body.status = status;
            const result = await youtubeRequest(youtubeToken, '/playlistItems', {
                method: 'PUT',
                query: { part: part ?? 'snippet', onBehalfOfContentOwner },
                body,
            });
            if (!result.ok) return { error: 'Failed to update playlist item', details: result.error };
            return result.data;
        } catch (error) {
            return {
                error: 'Error updating playlist item',
                message: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    },
});
