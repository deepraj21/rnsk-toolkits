// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { youtubeRequest, youtubeTokenField } from './client.js';

export const updateCaption = tool({
    description:
        "Updates caption track metadata (name, language, draft status). Only specified snippet fields change; content is not re-uploaded.",
    inputSchema: z.object({
        youtubeToken: youtubeTokenField,
        id: z.string().min(1).describe('Caption track ID from listCaptionTrack (NOT the video ID)'),
        snippet: z.object({
            name: z.string().max(150).optional().describe('Display name (max 150 chars)'),
            language: z.string().optional().describe("BCP-47 language tag, e.g. 'en'"),
            isDraft: z.boolean().optional().describe('True hides the track publicly'),
            videoId: z.string().optional().describe('Video associated with the track'),
        }),
    }),
    execute: async ({ youtubeToken, id, snippet }) => {
        try {
            const result = await youtubeRequest(youtubeToken, '/captions', {
                method: 'PUT',
                query: { part: 'snippet' },
                body: { id, snippet },
            });
            if (!result.ok) return { error: 'Failed to update caption track', details: result.error };
            return result.data;
        } catch (error) {
            return {
                error: 'Error updating caption track',
                message: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    },
});
