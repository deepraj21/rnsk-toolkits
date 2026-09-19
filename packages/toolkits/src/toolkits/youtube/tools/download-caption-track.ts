// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { youtubeRequest, youtubeTokenField } from './client.js';

export const downloadCaptionTrack = tool({
    description:
        'Downloads an owned caption track as text (srt/sbv/vtt). Requires owning the video — other videos return 403, including many auto-generated tracks.',
    inputSchema: z.object({
        youtubeToken: youtubeTokenField,
        id: z.string().min(1).describe('Caption track ID from listCaptionTrack (NOT the video ID)'),
        tfmt: z.string().optional().describe("Format: 'srt' (default), 'sbv', or 'vtt'"),
    }),
    execute: async ({ youtubeToken, id, tfmt }) => {
        try {
            const result = await youtubeRequest(youtubeToken, `/captions/${id}`, {
                query: { tfmt: tfmt ?? 'srt' },
                responseType: 'text',
            });
            if (!result.ok) return { error: 'Failed to download caption track', details: result.error };
            return { captionsText: result.data };
        } catch (error) {
            return {
                error: 'Error downloading caption track',
                message: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    },
});
