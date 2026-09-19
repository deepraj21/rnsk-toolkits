// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { YOUTUBE_UPLOAD_BASE, youtubeTokenField } from './client.js';
import { fetchVideoBytes, snippetStatusVideo } from './upload-shared.js';

export const uploadVideo = tool({
    description:
        'Uploads a video from a publicly accessible file URL using a resumable session (better for large files). File must be a YouTube-supported format.',
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
            const metadata = snippetStatusVideo(title, description, categoryId, privacyStatus, tags);
            const session = await fetch(`${YOUTUBE_UPLOAD_BASE}/videos?uploadType=resumable&part=snippet,status`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${youtubeToken}`,
                    'Content-Type': 'application/json; charset=UTF-8',
                    'X-Upload-Content-Type': 'video/*',
                },
                body: JSON.stringify(metadata),
            });
            if (!session.ok) {
                const details = await session.json().catch(() => ({}));
                return { error: 'Failed to start resumable upload', details };
            }
            const sessionUrl = session.headers.get('location');
            if (!sessionUrl) return { error: 'Upload session returned no location header' };
            const { bytes, contentType } = await fetchVideoBytes(videoUrl);
            const upload = await fetch(sessionUrl, {
                method: 'PUT',
                headers: { Authorization: `Bearer ${youtubeToken}`, 'Content-Type': contentType, 'Content-Length': String(bytes.length) },
                body: bytes,
            });
            if (!upload.ok) {
                const details = await upload.json().catch(() => ({}));
                return { error: 'Failed to upload video bytes', details };
            }
            return { responseData: await upload.json() };
        } catch (error) {
            return {
                error: 'Error uploading video',
                message: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    },
});
