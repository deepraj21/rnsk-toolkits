// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import {
    PLACES_API_BASE,
    googleMapsTokenField,
    mapsRequest,
    normalizePlaceName,
    toFieldMask,
} from './client.js';

const latlng = z.object({
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
});

const circleArea = z.object({
    center: latlng.describe('Center point'),
    radius: z.number().min(0).max(50000).describe('Radius in meters (0-50000)'),
});

const rectangleArea = z.object({
    low: latlng.describe('Southwest corner'),
    high: latlng.describe('Northeast corner'),
});

const areaSchema = z.object({ circle: circleArea.optional(), rectangle: rectangleArea.optional() });

export const autocompletePlaces = tool({
    description:
        'Returns up to 5 place/query predictions for as-you-type input, ordered by relevance. Use a sessionToken to group calls for billing.',
    inputSchema: z.object({
        googleMapsToken: googleMapsTokenField,
        input: z.string().min(1).describe('Text to predict: names, addresses, plus codes'),
        languageCode: z.string().optional().describe("BCP-47 language, e.g. 'en-US'"),
        regionCode: z.string().optional().describe("ccTLD region for formatting, e.g. 'us'"),
        sessionToken: z.string().optional().describe('Session string for billing grouping'),
        origin: latlng.optional().describe('Point for distance calculations'),
        inputOffset: z.number().min(0).optional().describe('Cursor offset in input'),
        locationBias: areaSchema.optional().describe('Area to prefer'),
        locationRestriction: areaSchema.optional().describe('Area to restrict to'),
        includedRegionCodes: z.array(z.string()).max(15).optional().describe('ISO country codes to restrict to (disables query predictions)'),
        includedPrimaryTypes: z.array(z.string()).max(5).optional().describe("Place types, e.g. ['restaurant']"),
        includeQueryPredictions: z.boolean().optional(),
        includePureServiceAreaBusinesses: z.boolean().optional(),
    }),
    execute: async ({ googleMapsToken, ...body }) => {
        try {
            const result = await mapsRequest(googleMapsToken, PLACES_API_BASE, '/places:autocomplete', {
                method: 'POST',
                body,
            });
            if (!result.ok) return { error: 'Failed to autocomplete places', details: result.error };
            return result.data;
        } catch (error) {
            return { error: 'Error autocompleting places', message: error instanceof Error ? error.message : 'Unknown error' };
        }
    },
});

export const getPlaceDetails = tool({
    description:
        'Gets full details for a place ID (find IDs via text/nearby search first — never pass names or addresses). Select fields via fieldMask for cost/performance.',
    inputSchema: z.object({
        googleMapsToken: googleMapsTokenField,
        name: z.string().describe("Place ID as 'places/{id}' or bare ID"),
        fieldMask: z.string().optional().describe("Fields, e.g. 'id,displayName,formattedAddress' (default those three)"),
        languageCode: z.string().optional().describe("BCP-47 language, e.g. 'en'"),
        regionCode: z.string().optional().describe("CLDR region, e.g. 'US'"),
        sessionToken: z.string().optional().describe('Autocomplete session token for billing'),
    }),
    execute: async ({ googleMapsToken, name, fieldMask, languageCode, regionCode, sessionToken }) => {
        try {
            const result = await mapsRequest(googleMapsToken, PLACES_API_BASE, `/${normalizePlaceName(name)}`, {
                query: { languageCode, regionCode, sessionToken },
                headers: { 'X-Goog-FieldMask': toFieldMask(fieldMask, '', 'id,displayName,formattedAddress') },
            });
            if (!result.ok) return { error: 'Failed to get place details', details: result.error };
            return result.data;
        } catch (error) {
            return { error: 'Error getting place details', message: error instanceof Error ? error.message : 'Unknown error' };
        }
    },
});

export const textSearchPlaces = tool({
    description:
        'Searches places by text query ("restaurants in London"). Include city/region/type for precision; filter CLOSED places by businessStatus; dedupe by id; throttle ~1 req/s.',
    inputSchema: z.object({
        googleMapsToken: googleMapsTokenField,
        textQuery: z.string().min(1).describe('Query matched against name, address, category'),
        fieldMask: z.string().optional().describe("Fields (default 'places.displayName,places.formattedAddress,places.priceLevel')"),
        maxResultCount: z.number().min(1).max(20).optional().describe('Results to return (1-20, default 10)'),
    }),
    execute: async ({ googleMapsToken, textQuery, fieldMask, maxResultCount }) => {
        try {
            const result = await mapsRequest(googleMapsToken, PLACES_API_BASE, '/places:searchText', {
                method: 'POST',
                headers: { 'X-Goog-FieldMask': toFieldMask(fieldMask, 'places', 'places.displayName,places.formattedAddress,places.priceLevel') },
                body: { textQuery, maxResultCount },
            });
            if (!result.ok) return { error: 'Failed to text search places', details: result.error };
            return result.data;
        } catch (error) {
            return { error: 'Error text searching places', message: error instanceof Error ? error.message : 'Unknown error' };
        }
    },
});

export const nearbySearchPlaces = tool({
    description:
        'Finds places in a circle (radius ≤50000m, max 20 results). Use Table-A types (restaurant, not food); locality/city/town/sublocality/landmark are invalid filters.',
    inputSchema: z.object({
        googleMapsToken: googleMapsTokenField,
        latitude: z.number().min(-90).max(90).describe('Search center latitude'),
        longitude: z.number().min(-180).max(180).describe('Search center longitude'),
        radius: z.number().min(0).max(50000).describe('Radius in meters'),
        includedTypes: z.array(z.string()).max(50).optional().describe("Table-A types to include, e.g. ['restaurant']"),
        excludedTypes: z.array(z.string()).max(50).optional().describe('Table-A types to exclude'),
        maxResultCount: z.number().min(1).max(20).optional().describe('Results (1-20, default 10)'),
        fieldMask: z.string().optional().describe("Fields (default 'places.displayName')"),
    }),
    execute: async ({ googleMapsToken, latitude, longitude, radius, includedTypes, excludedTypes, maxResultCount, fieldMask }) => {
        try {
            const body: Record<string, unknown> = {
                locationRestriction: { circle: { center: { latitude, longitude }, radius } },
            };
            if (includedTypes) body.includedTypes = includedTypes;
            if (excludedTypes) body.excludedTypes = excludedTypes;
            if (maxResultCount !== undefined) body.maxResultCount = maxResultCount;
            const result = await mapsRequest(googleMapsToken, PLACES_API_BASE, '/places:searchNearby', {
                method: 'POST',
                headers: { 'X-Goog-FieldMask': toFieldMask(fieldMask, 'places', 'places.displayName') },
                body,
            });
            if (!result.ok) return { error: 'Failed to nearby search places', details: result.error };
            return result.data;
        } catch (error) {
            return { error: 'Error nearby searching places', message: error instanceof Error ? error.message : 'Unknown error' };
        }
    },
});

export const getPlacePhoto = tool({
    description:
        'Downloads a place photo by resource name (places/{id}/photos/{ref}) as base64 bytes. Needs maxWidthPx and/or maxHeightPx (1-4800). Show attribution from the search/details response.',
    inputSchema: z.object({
        googleMapsToken: googleMapsTokenField,
        photoReference: z.string().describe("Photo name 'places/{id}/photos/{ref}' (legacy bare refs need apiKey)"),
        maxWidthPx: z.number().min(1).max(4800).optional().describe('Max width (1-4800)'),
        maxHeightPx: z.number().min(1).max(4800).optional().describe('Max height (1-4800)'),
        apiKey: z.string().optional().describe('API key for legacy bare photo references'),
        skipHttpRedirect: z.boolean().optional(),
    }),
    execute: async ({ googleMapsToken, photoReference, maxWidthPx, maxHeightPx, apiKey, skipHttpRedirect }) => {
        try {
            if (photoReference.startsWith('places/')) {
                if (maxWidthPx === undefined && maxHeightPx === undefined) {
                    return { error: 'Provide maxWidthPx and/or maxHeightPx' };
                }
                const result = await mapsRequest(googleMapsToken, PLACES_API_BASE, `/${photoReference}/media`, {
                    query: { maxWidthPx, maxHeightPx, skipHttpRedirect },
                    responseType: 'bytes',
                });
                if (!result.ok) return { error: 'Failed to get place photo', details: result.error };
                const data = result.data as { contentBase64?: string; byteSize?: number; mimetype?: string };
                return { photo: { name: `photo-${Date.now()}.jpg`, mimetype: data.mimetype ?? 'image/jpeg', contentBase64: data.contentBase64, byteSize: data.byteSize } };
            }
            if (!apiKey) return { error: 'Legacy photo references require apiKey' };
            const url =
                `https://maps.googleapis.com/maps/api/place/photo?photoreference=${encodeURIComponent(photoReference)}` +
                `&key=${encodeURIComponent(apiKey)}` +
                (maxWidthPx !== undefined ? `&maxwidth=${maxWidthPx}` : '') +
                (maxHeightPx !== undefined ? `&maxheight=${maxHeightPx}` : '');
            const response = await fetch(url);
            if (!response.ok) return { error: `Photo download failed (HTTP ${response.status})` };
            const bytes = Buffer.from(await response.arrayBuffer());
            return {
                photo: {
                    name: `photo-${Date.now()}.jpg`,
                    mimetype: response.headers.get('content-type') ?? 'image/jpeg',
                    contentBase64: bytes.toString('base64'),
                    byteSize: bytes.length,
                },
            };
        } catch (error) {
            return { error: 'Error getting place photo', message: error instanceof Error ? error.message : 'Unknown error' };
        }
    },
});
