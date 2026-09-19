// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { googlePhotosTokenField, photosRequest } from './client.js';

export const batchGetMediaItems = tool({
    description: 'Gets up to 50 media items by ID (no duplicates). Failed items return a status entry.',
    inputSchema: z.object({
        googlePhotosToken: googlePhotosTokenField,
        mediaItemIds: z.array(z.string()).min(1).max(50).describe('Media item IDs, no duplicates'),
    }),
    execute: async ({ googlePhotosToken, mediaItemIds }) => {
        try {
            if (new Set(mediaItemIds).size !== mediaItemIds.length) return { error: 'mediaItemIds must not contain duplicates' };
            const result = await photosRequest(googlePhotosToken, '/mediaItems:batchGet', {
                query: { mediaItemIds },
            });
            if (!result.ok) return { error: 'Failed to batch get media items', details: result.error };
            return result.data;
        } catch (error) {
            return { error: 'Error batch getting media items', message: error instanceof Error ? error.message : 'Unknown error' };
        }
    },
});

export const listMediaItems = tool({
    description:
        'Lists app-created media items (post-March-2025 API returns only your app uploads — camera/other-app photos need the Picker API).',
    inputSchema: z.object({
        googlePhotosToken: googlePhotosTokenField,
        pageSize: z.number().min(1).max(100).optional().describe('Items per page (default 25, max 100)'),
        pageToken: z.string().optional(),
    }),
    execute: async ({ googlePhotosToken, pageSize, pageToken }) => {
        try {
            const result = await photosRequest(googlePhotosToken, '/mediaItems', {
                query: { pageSize, pageToken },
            });
            if (!result.ok) return { error: 'Failed to list media items', details: result.error };
            return result.data;
        } catch (error) {
            return { error: 'Error listing media items', message: error instanceof Error ? error.message : 'Unknown error' };
        }
    },
});

export const searchMediaItems = tool({
    description:
        'Searches app-created media by album, date/content/feature/media-type filters, and ordering. Only one of albumId or filters should drive the query.',
    inputSchema: z.object({
        googlePhotosToken: googlePhotosTokenField,
        albumId: z.string().optional().describe('Album to search within'),
        filters: z.record(z.any()).optional().describe('Filters: dateFilter, contentFilter, mediaTypeFilter, featureFilter, includeArchivedMedia, excludeNonAppCreatedData'),
        orderBy: z.string().optional().describe("Sort, e.g. 'MediaMetadata.creation_time desc'"),
        pageSize: z.number().min(1).max(100).optional().describe('Items per page (default 25, max 100)'),
        pageToken: z.string().optional(),
    }),
    execute: async ({ googlePhotosToken, albumId, filters, orderBy, pageSize, pageToken }) => {
        try {
            const body: Record<string, unknown> = {};
            if (albumId) body.albumId = albumId;
            if (filters) body.filters = filters;
            if (orderBy) body.orderBy = orderBy;
            if (pageSize !== undefined) body.pageSize = pageSize;
            if (pageToken) body.pageToken = pageToken;
            const result = await photosRequest(googlePhotosToken, '/mediaItems:search', {
                method: 'POST',
                body,
            });
            if (!result.ok) return { error: 'Failed to search media items', details: result.error };
            return result.data;
        } catch (error) {
            return { error: 'Error searching media items', message: error instanceof Error ? error.message : 'Unknown error' };
        }
    },
});

export const updateMediaItem = tool({
    description: 'Updates an app-created media item description (max 1000 chars).',
    inputSchema: z.object({
        googlePhotosToken: googlePhotosTokenField,
        mediaItemId: z.string().describe('Media item ID to update'),
        description: z.string().max(1000).describe('New description'),
    }),
    execute: async ({ googlePhotosToken, mediaItemId, description }) => {
        try {
            const result = await photosRequest(googlePhotosToken, `/mediaItems/${mediaItemId}`, {
                method: 'PATCH',
                query: { updateMask: 'description' },
                body: { description },
            });
            if (!result.ok) return { error: 'Failed to update media item', details: result.error };
            return result.data;
        } catch (error) {
            return { error: 'Error updating media item', message: error instanceof Error ? error.message : 'Unknown error' };
        }
    },
});

export const downloadMediaItem = tool({
    description:
        'Downloads a media item bytes (base64) via its baseUrl. Use baseUrl sizing params before download if you need a specific size.',
    inputSchema: z.object({
        googlePhotosToken: googlePhotosTokenField,
        mediaItemId: z.string().describe('Media item ID to download'),
    }),
    execute: async ({ googlePhotosToken, mediaItemId }) => {
        try {
            const meta = await photosRequest(googlePhotosToken, `/mediaItems/${mediaItemId}`);
            if (!meta.ok) return { error: 'Failed to get media item', details: meta.error };
            const item = meta.data as { baseUrl?: string; filename?: string; mimeType?: string; mediaMetadata?: { photo?: unknown } };
            if (!item.baseUrl) return { error: 'Media item has no downloadable baseUrl' };
            const downloadUrl = `${item.baseUrl}=d`;
            const response = await fetch(downloadUrl, {
                headers: { Authorization: `Bearer ${googlePhotosToken}` },
            });
            if (!response.ok) return { error: `Download failed (HTTP ${response.status})` };
            const bytes = Buffer.from(await response.arrayBuffer());
            return {
                file: {
                    name: item.filename ?? `${mediaItemId}`,
                    mimetype: response.headers.get('content-type') ?? item.mimeType ?? 'application/octet-stream',
                    contentBase64: bytes.toString('base64'),
                    byteSize: bytes.length,
                },
            };
        } catch (error) {
            return { error: 'Error downloading media item', message: error instanceof Error ? error.message : 'Unknown error' };
        }
    },
});
