// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { googlePhotosTokenField, photosRequest } from './client.js';

const albumPosition = z.object({
    position: z.enum(['POSITION_TYPE_UNSPECIFIED', 'FIRST_IN_ALBUM', 'LAST_IN_ALBUM', 'AFTER_MEDIA_ITEM', 'AFTER_ENRICHMENT_ITEM']),
    relativeMediaItemId: z.string().optional().describe('Required for AFTER_MEDIA_ITEM'),
    relativeEnrichmentItemId: z.string().optional().describe('Required for AFTER_ENRICHMENT_ITEM'),
});

export const createAlbum = tool({
    description: 'Creates an album with a title (max 500 chars). Add items afterwards with batchAddMediaItems.',
    inputSchema: z.object({
        googlePhotosToken: googlePhotosTokenField,
        title: z.string().min(1).max(500).describe('Album title'),
    }),
    execute: async ({ googlePhotosToken, title }) => {
        try {
            const result = await photosRequest(googlePhotosToken, '/albums', {
                method: 'POST',
                body: { album: { title } },
            });
            if (!result.ok) return { error: 'Failed to create album', details: result.error };
            return result.data;
        } catch (error) {
            return { error: 'Error creating album', message: error instanceof Error ? error.message : 'Unknown error' };
        }
    },
});

export const getAlbum = tool({
    description: 'Gets an album by ID.',
    inputSchema: z.object({
        googlePhotosToken: googlePhotosTokenField,
        albumId: z.string().describe('Album ID'),
    }),
    execute: async ({ googlePhotosToken, albumId }) => {
        try {
            const result = await photosRequest(googlePhotosToken, `/albums/${albumId}`);
            if (!result.ok) return { error: 'Failed to get album', details: result.error };
            return result.data;
        } catch (error) {
            return { error: 'Error getting album', message: error instanceof Error ? error.message : 'Unknown error' };
        }
    },
});

export const listAlbums = tool({
    description: 'Lists albums in the Albums tab with pagination.',
    inputSchema: z.object({
        googlePhotosToken: googlePhotosTokenField,
        pageSize: z.number().min(1).max(50).optional().describe('Albums per page (default 20, max 50)'),
        pageToken: z.string().optional(),
        excludeNonAppCreatedData: z.boolean().optional().describe('Only app-created media counts'),
    }),
    execute: async ({ googlePhotosToken, pageSize, pageToken, excludeNonAppCreatedData }) => {
        try {
            const result = await photosRequest(googlePhotosToken, '/albums', {
                query: { pageSize, pageToken, excludeNonAppCreatedData },
            });
            if (!result.ok) return { error: 'Failed to list albums', details: result.error };
            return result.data;
        } catch (error) {
            return { error: 'Error listing albums', message: error instanceof Error ? error.message : 'Unknown error' };
        }
    },
});

export const updateAlbum = tool({
    description: 'Updates an app-created album title and/or cover photo. Provide at least one of title or coverPhotoMediaItemId.',
    inputSchema: z.object({
        googlePhotosToken: googlePhotosTokenField,
        albumId: z.string().describe('Album ID to update'),
        title: z.string().max(500).optional().describe('New title'),
        coverPhotoMediaItemId: z.string().optional().describe('Media item ID for the cover'),
    }),
    execute: async ({ googlePhotosToken, albumId, title, coverPhotoMediaItemId }) => {
        try {
            if (title === undefined && coverPhotoMediaItemId === undefined) {
                return { error: 'Provide title and/or coverPhotoMediaItemId' };
            }
            const mask: string[] = [];
            const body: Record<string, unknown> = {};
            if (title !== undefined) {
                mask.push('title');
                body.title = title;
            }
            if (coverPhotoMediaItemId !== undefined) {
                mask.push('coverPhotoMediaItemId');
                body.coverPhotoMediaItemId = coverPhotoMediaItemId;
            }
            const result = await photosRequest(googlePhotosToken, `/albums/${albumId}`, {
                method: 'PATCH',
                query: { updateMask: mask.join(',') },
                body,
            });
            if (!result.ok) return { error: 'Failed to update album', details: result.error };
            return result.data;
        } catch (error) {
            return { error: 'Error updating album', message: error instanceof Error ? error.message : 'Unknown error' };
        }
    },
});

export const addEnrichment = tool({
    description: 'Adds a text, location, or map enrichment at a position in an album. AFTER_* positions need the relative item ID.',
    inputSchema: z.object({
        googlePhotosToken: googlePhotosTokenField,
        albumId: z.string().describe('Album ID'),
        newEnrichmentItem: z.object({
            textEnrichment: z.object({ text: z.string() }).optional(),
            locationEnrichment: z.object({
                location: z.object({
                    locationName: z.string(),
                    latlng: z.object({ latitude: z.number().min(-90).max(90), longitude: z.number().min(-180).max(180) }),
                }),
            }).optional(),
            mapEnrichment: z.object({
                origin: z.object({
                    locationName: z.string(),
                    latlng: z.object({ latitude: z.number().min(-90).max(90), longitude: z.number().min(-180).max(180) }),
                }),
                destination: z.object({
                    locationName: z.string(),
                    latlng: z.object({ latitude: z.number().min(-90).max(90), longitude: z.number().min(-180).max(180) }),
                }),
            }).optional(),
        }).describe('Exactly one of text/location/map enrichment'),
        albumPosition: albumPosition.describe('Insert position'),
    }),
    execute: async ({ googlePhotosToken, albumId, newEnrichmentItem, albumPosition }) => {
        try {
            const kinds = ['textEnrichment', 'locationEnrichment', 'mapEnrichment'].filter((k) => newEnrichmentItem[k as keyof typeof newEnrichmentItem] !== undefined);
            if (kinds.length !== 1) return { error: 'newEnrichmentItem must contain exactly one of textEnrichment, locationEnrichment, mapEnrichment' };
            if (albumPosition.position === 'AFTER_MEDIA_ITEM' && !albumPosition.relativeMediaItemId) {
                return { error: 'AFTER_MEDIA_ITEM requires relativeMediaItemId' };
            }
            if (albumPosition.position === 'AFTER_ENRICHMENT_ITEM' && !albumPosition.relativeEnrichmentItemId) {
                return { error: 'AFTER_ENRICHMENT_ITEM requires relativeEnrichmentItemId' };
            }
            const result = await photosRequest(googlePhotosToken, `/albums/${albumId}:addEnrichment`, {
                method: 'POST',
                body: { newEnrichmentItem, albumPosition },
            });
            if (!result.ok) return { error: 'Failed to add enrichment', details: result.error };
            return result.data;
        } catch (error) {
            return { error: 'Error adding enrichment', message: error instanceof Error ? error.message : 'Unknown error' };
        }
    },
});

export const batchAddMediaItems = tool({
    description: 'Adds up to 50 app-created media items to an app-created album.',
    inputSchema: z.object({
        googlePhotosToken: googlePhotosTokenField,
        albumId: z.string().min(1).describe('App-created album ID'),
        mediaItemIds: z.array(z.string()).min(1).max(50).describe('App-created media item IDs'),
    }),
    execute: async ({ googlePhotosToken, albumId, mediaItemIds }) => {
        try {
            const result = await photosRequest(googlePhotosToken, `/albums/${albumId}:batchAddMediaItems`, {
                method: 'POST',
                body: { mediaItemIds },
            });
            if (!result.ok) return { error: 'Failed to add media items to album', details: result.error };
            return { albumId, mediaItemsAdded: mediaItemIds.length, message: 'Successfully added media items to album' };
        } catch (error) {
            return { error: 'Error adding media items to album', message: error instanceof Error ? error.message : 'Unknown error' };
        }
    },
});
