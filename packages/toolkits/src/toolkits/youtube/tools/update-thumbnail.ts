// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { YOUTUBE_UPLOAD_BASE, youtubeTokenField } from './client.js';

export const updateThumbnail = tool({
    description:
        'Sets a custom thumbnail from a publicly accessible image URL (JPG/PNG/GIF, under 2MB, 1280x720 recommended). Channel must be verified and video owned.',
    inputSchema: z.object({
        youtubeToken: youtubeTokenField,
        videoId: z.string().describe('Video ID to set the thumbnail for (must be owned)'),
        thumbnailUrl: z.string().min(1).describe('Public URL of the thumbnail image'),
    }),
    execute: async ({ youtubeToken, videoId, thumbnailUrl }) => {
        try {
            const imageResponse = await fetch(thumbnailUrl);
            if (!imageResponse.ok) return { error: `Failed to fetch thumbnail image (HTTP ${imageResponse.status})` };
            const contentType = imageResponse.headers.get('content-type') ?? 'image/jpeg';
            const bytes = Buffer.from(await imageResponse.arrayBuffer());
            const response = await fetch(`${YOUTUBE_UPLOAD_BASE}/thumbnails/set?videoId=${encodeURIComponent(videoId)}`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${youtubeToken}`, 'Content-Type': contentType },
                body: bytes,
            });
            if (!response.ok) {
                const details = await response.json().catch(() => ({}));
                return { error: 'Failed to set thumbnail', details };
            }
            return await response.json();
        } catch (error) {
            return {
                error: 'Error setting thumbnail',
                message: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    },
});
