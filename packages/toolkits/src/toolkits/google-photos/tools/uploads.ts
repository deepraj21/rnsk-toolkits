// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import {
    fetchUrlBytes,
    fileNameFromUrl,
    googlePhotosTokenField,
    photosRequest,
    uploadBytes,
} from './client.js';

interface UploadInput { fileName: string; description: string; url: string }

async function uploadOne(googlePhotosToken: string, input: UploadInput) {
    const { bytes, contentType } = await fetchUrlBytes(input.url);
    const uploadToken = await uploadBytes(googlePhotosToken, input.fileName, bytes, contentType);
    return { description: input.description, simpleMediaItem: { fileName: input.fileName, uploadToken } };
}

export const batchCreateMediaItems = tool({
    description:
        'Uploads up to 50 files from public URLs and creates media items (optionally into an album at a position). s3key file refs are not resolvable — provide public URLs instead.',
    inputSchema: z.object({
        googlePhotosToken: googlePhotosTokenField,
        urls: z.array(z.string()).optional().describe('Public file URLs (names extracted automatically)'),
        mediaFiles: z.array(z.object({
            url: z.string().optional().describe('Public file URL'),
            fileName: z.string().optional().describe("File name with extension (required with url), e.g. 'photo.jpg'"),
            description: z.string().max(1000).optional().describe('Item description'),
        })).optional().describe('Files with explicit names/descriptions (max 50 total with urls)'),
        albumId: z.string().optional().describe('Album for the new items (library-only if omitted)'),
        albumPosition: z.record(z.any()).optional().describe('Position in the album'),
    }),
    execute: async ({ googlePhotosToken, urls, mediaFiles, albumId, albumPosition }) => {
        try {
            const inputs: UploadInput[] = [
                ...(urls ?? []).map((url, i) => ({
                    url,
                    fileName: fileNameFromUrl(url, `photo-${i + 1}.jpg`),
                    description: '',
                })),
                ...(mediaFiles ?? []).map((m) => ({
                    url: m.url ?? '',
                    fileName: m.fileName ?? (m.url ? fileNameFromUrl(m.url, 'photo.jpg') : 'photo.jpg'),
                    description: m.description ?? '',
                })),
            ];
            if (inputs.length === 0) return { error: 'Provide urls and/or mediaFiles with public URLs' };
            if (inputs.length > 50) return { error: 'Maximum 50 items per request' };
            const missing = inputs.filter((i) => !i.url);
            if (missing.length > 0) return { error: 'Every media file needs a public url (s3key refs are not resolvable)' };

            const newMediaItems = [];
            const results: Array<Record<string, unknown>> = [];
            for (const input of inputs) {
                try {
                    newMediaItems.push(await uploadOne(googlePhotosToken, input));
                } catch (error) {
                    results.push({ status: { message: error instanceof Error ? error.message : 'Upload failed' } });
                }
            }
            if (newMediaItems.length > 0) {
                const body: Record<string, unknown> = { newMediaItems };
                if (albumId) body.albumId = albumId;
                if (albumPosition) body.albumPosition = albumPosition;
                const created = await photosRequest(googlePhotosToken, '/mediaItems:batchCreate', {
                    method: 'POST',
                    body,
                });
                if (!created.ok) return { error: 'Failed to create media items', details: created.error };
                const data = created.data as { newMediaItemResults?: Array<Record<string, unknown>> };
                results.push(...(data.newMediaItemResults ?? []));
            }
            return { newMediaItemResults: results };
        } catch (error) {
            return { error: 'Error batch creating media items', message: error instanceof Error ? error.message : 'Unknown error' };
        }
    },
});

export const uploadMedia = tool({
    description:
        'Uploads one file (images ≤200MB, videos ≤20GB) from a public URL and creates the media item. s3key file refs are not resolvable.',
    inputSchema: z.object({
        googlePhotosToken: googlePhotosTokenField,
        url: z.string().optional().describe('Public file URL (JPEG/PNG/GIF/HEIC/MP4/MOV/...)'),
        fileName: z.string().optional().describe("File name with extension (required with url), e.g. 'photo.jpg'"),
        description: z.string().max(1000).optional().describe('Item description'),
    }),
    execute: async ({ googlePhotosToken, url, fileName, description }) => {
        try {
            if (!url) return { error: 'Provide a public url (s3key refs are not resolvable)' };
            const name = fileName ?? fileNameFromUrl(url, 'photo.jpg');
            const newMediaItems = [await uploadOne(googlePhotosToken, { url, fileName: name, description: description ?? '' })];
            const created = await photosRequest(googlePhotosToken, '/mediaItems:batchCreate', {
                method: 'POST',
                body: { newMediaItems },
            });
            if (!created.ok) return { error: 'Failed to create media item', details: created.error };
            const data = created.data as { newMediaItemResults?: Array<{ mediaItem?: unknown; status?: unknown }> };
            const first = data.newMediaItemResults?.[0];
            if (!first?.mediaItem) return { error: 'Failed to create media item', details: first?.status ?? created.data };
            return { mediaItem: first.mediaItem };
        } catch (error) {
            return { error: 'Error uploading media', message: error instanceof Error ? error.message : 'Unknown error' };
        }
    },
});
