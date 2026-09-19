// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { youtubeRequest, youtubeTokenField } from './client.js';

export const updateVideo = tool({
    description:
        'Updates video metadata (title, description, tags, category, privacy) by ID. Fetches current snippet/status first so omitted fields are preserved; an empty tags list clears all tags.',
    inputSchema: z.object({
        youtubeToken: youtubeTokenField,
        videoId: z.string().describe('Video ID to update (must exist)'),
        title: z.string().max(100).optional().describe('New title (max 100 chars)'),
        description: z.string().optional().describe('New description (max 5000 bytes)'),
        tags: z.array(z.string()).optional().describe('New tags list; empty array removes all tags'),
        categoryId: z.string().optional().describe('New category ID as string'),
        privacyStatus: z.enum(['public', 'private', 'unlisted']).optional(),
    }),
    execute: async ({ youtubeToken, videoId, title, description, tags, categoryId, privacyStatus }) => {
        try {
            const current = await youtubeRequest(youtubeToken, '/videos', {
                query: { part: 'snippet,status', id: videoId },
            });
            if (!current.ok) return { error: 'Failed to fetch current video', details: current.error };
            const items = (current.data as { items?: Array<Record<string, unknown>> }).items ?? [];
            if (items.length === 0) return { error: `Video not found: ${videoId}` };
            const existing = items[0];
            const snippet = { ...(existing.snippet as Record<string, unknown>) };
            const status = { ...(existing.status as Record<string, unknown>) };
            if (title !== undefined) snippet.title = title;
            if (description !== undefined) snippet.description = description;
            if (categoryId !== undefined) snippet.categoryId = String(categoryId);
            if (tags !== undefined) snippet.tags = tags.map((t) => t.replace(/[<>]/g, ''));
            if (privacyStatus !== undefined) status.privacyStatus = privacyStatus;
            const result = await youtubeRequest(youtubeToken, '/videos', {
                method: 'PUT',
                query: { part: 'snippet,status' },
                body: { id: videoId, snippet, status },
            });
            if (!result.ok) return { error: 'Failed to update video', details: result.error };
            return result.data;
        } catch (error) {
            return {
                error: 'Error updating video',
                message: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    },
});
