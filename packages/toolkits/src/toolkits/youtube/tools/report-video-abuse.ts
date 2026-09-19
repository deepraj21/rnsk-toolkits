// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { youtubeRequest, youtubeTokenField } from './client.js';

export const reportVideoAbuse = tool({
    description:
        'Reports a video for abusive content. List valid reasons with listVideoAbuseReportReasons first.',
    inputSchema: z.object({
        youtubeToken: youtubeTokenField,
        videoId: z.string().describe('Video ID being reported'),
        reasonId: z.enum(['N', 'V', 'C', 'M', 'E', 'H']).describe('Reason: N nudity, V violent/hateful, C child abuse, M medical misinformation, E extremism, H harassment'),
        secondaryReasonId: z.string().optional().describe('More specific secondary reason'),
        comments: z.string().optional().describe('Additional reporter information'),
        language: z.string().optional().describe("Reporter language, e.g. 'en'"),
    }),
    execute: async ({ youtubeToken, videoId, reasonId, secondaryReasonId, comments, language }) => {
        try {
            const body: Record<string, unknown> = { videoId, reasonId };
            if (secondaryReasonId) body.secondaryReasonId = secondaryReasonId;
            if (comments) body.comments = comments;
            if (language) body.language = language;
            const result = await youtubeRequest(youtubeToken, '/videos/reportAbuse', {
                method: 'POST',
                body,
            });
            if (!result.ok) return { error: 'Failed to report video', details: result.error };
            return { success: true, httpStatus: 204, message: 'Abuse report submitted successfully' };
        } catch (error) {
            return {
                error: 'Error reporting video',
                message: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    },
});
