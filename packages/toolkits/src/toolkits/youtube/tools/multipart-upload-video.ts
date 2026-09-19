// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { YOUTUBE_UPLOAD_BASE, youtubeTokenField } from './client.js';
import { buildMultipart, fetchVideoBytes, snippetStatusVideo } from './upload-shared.js';

export const multipartUploadVideo = tool({
    description:
        'Uploads a video (metadata + bytes in one multipart request) from a publicly accessible file URL. File must be a YouTube-supported format.',
    inputSchema: z.object({
        youtubeToken: youtubeTokenField,
        videoUrl: z.string().describe('Public URL of the video file to upload'),
        title: z.string().describe('Video title'),
        description: z.string().describe('Video description'),
        categoryId: z.string().describe("Category ID, e.g. '22'"),
        privacyStatus: z.enum(['public', 'private', 'unlisted']),
        tags: z.array(z.string()).optional().describe('Keyword tags for discoverability'),
    }),
    execute: async ({ youtubeToken, videoUrl, title, description, categoryId, privacyStatus, tags }) => {
        try {
            const { bytes, contentType } = await fetchVideoBytes(videoUrl);
            const { body, boundary } = buildMultipart(
                snippetStatusVideo(title, description, categoryId, privacyStatus, tags),
                bytes,
                contentType,
            );
            const response = await fetch(`${YOUTUBE_UPLOAD_BASE}/videos?uploadType=multipart&part=snippet,status`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${youtubeToken}`, 'Content-Type': `multipart/related; boundary=${boundary}` },
                body,
            });
            if (!response.ok) {
                const details = await response.json().catch(() => ({}));
                return { error: 'Failed to upload video', details };
            }
            return { video: await response.json() };
        } catch (error) {
            return {
                error: 'Error uploading video',
                message: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    },
});
