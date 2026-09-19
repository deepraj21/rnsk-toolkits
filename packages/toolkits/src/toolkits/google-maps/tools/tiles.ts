// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { TILE_API_BASE, googleMapsTokenField, mapsRequest } from './client.js';

export const createTilesSession = tool({
    description:
        'Creates a ~2-week session token for 2D tiles and Street View. Each call costs quota — cache and reuse the token.',
    inputSchema: z.object({
        googleMapsToken: googleMapsTokenField,
        mapType: z.enum(['roadmap', 'satellite', 'terrain', 'streetview']).describe('Base map type'),
        language: z.string().describe("IETF language, e.g. 'en-US'"),
        region: z.string().describe("CLDR region, e.g. 'US'"),
        scale: z.enum(['scaleFactor1x', 'scaleFactor2x', 'scaleFactor4x']).optional(),
        highDpi: z.boolean().optional().describe('High-res tiles (needs 2x/4x scale)'),
        overlay: z.boolean().optional().describe('Separate layers vs combined image'),
        layerTypes: z.array(z.enum(['layerRoadmap', 'layerStreetview', 'layerTraffic'])).optional(),
        styles: z.array(z.record(z.any())).optional().describe('Roadmap JSON styles'),
        imageFormat: z.enum(['jpeg', 'png']).optional(),
    }),
    execute: async ({ googleMapsToken, ...body }) => {
        try {
            const result = await mapsRequest(googleMapsToken, TILE_API_BASE, '/createSession', {
                method: 'POST',
                body,
            });
            if (!result.ok) return { error: 'Failed to create tiles session', details: result.error };
            return result.data;
        } catch (error) {
            return { error: 'Error creating tiles session', message: error instanceof Error ? error.message : 'Unknown error' };
        }
    },
});

export const get2dTile = tool({
    description:
        'Downloads one 2D tile image (PNG/JPEG, ~256px) as base64. Needs a session from createTilesSession; x/y ranges depend on zoom.',
    inputSchema: z.object({
        googleMapsToken: googleMapsTokenField,
        z: z.number().min(0).max(22).describe('Zoom 0 (world) to 22 (detailed)'),
        x: z.number().min(0).describe('Column in [0, 2^zoom - 1]'),
        y: z.number().min(0).describe('Row in [0, 2^zoom - 1]'),
        session: z.string().describe('Session token from createTilesSession'),
        key: z.string().optional().describe('API key alternative to Bearer auth'),
        orientation: z.number().optional().describe('Counter-clockwise rotation: 0, 90, 180, or 270'),
    }),
    execute: async ({ googleMapsToken, z, x, y, session, key, orientation }) => {
        try {
            const max = 2 ** z - 1;
            if (x > max || y > max) return { error: `x and y must be within [0, ${max}] for zoom ${z}` };
            const result = await mapsRequest(googleMapsToken, TILE_API_BASE, `/2dtiles/${z}/${x}/${y}`, {
                query: { session, key, orientation },
                responseType: 'bytes',
            });
            if (!result.ok) return { error: 'Failed to get 2D tile', details: result.error };
            const data = result.data as { contentBase64?: string; byteSize?: number; mimetype?: string };
            return { tile: { name: `tile-${z}-${x}-${y}`, mimetype: data.mimetype ?? 'image/png', contentBase64: data.contentBase64, byteSize: data.byteSize } };
        } catch (error) {
            return { error: 'Error getting 2D tile', message: error instanceof Error ? error.message : 'Unknown error' };
        }
    },
});

export const get3dTilesRoot = tool({
    description:
        'Gets the photorealistic 3D tileset root (OGC 3D Tiles) to bootstrap a renderer. Billable per call — cache the response.',
    inputSchema: z.object({
        googleMapsToken: googleMapsTokenField,
        key: z.string().optional().describe('API key alternative to Bearer auth'),
    }),
    execute: async ({ googleMapsToken, key }) => {
        try {
            const result = await mapsRequest(googleMapsToken, TILE_API_BASE, '/3dtiles/root.json', {
                query: { key },
            });
            if (!result.ok) return { error: 'Failed to get 3D tiles root', details: result.error };
            return result.data;
        } catch (error) {
            return { error: 'Error getting 3D tiles root', message: error instanceof Error ? error.message : 'Unknown error' };
        }
    },
});
