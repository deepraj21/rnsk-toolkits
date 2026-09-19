// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { GEOCODE_API_BASE, googleMapsTokenField, mapsRequest } from './client.js';

export const geocodeAddressWithQuery = tool({
    description:
        'Converts a full address string to coordinates (v4beta). Include city/state/country — vague strings return zero or wrong results. Verify formattedAddress before use.',
    inputSchema: z.object({
        googleMapsToken: googleMapsTokenField,
        addressQuery: z.string().min(1).describe("Full address, e.g. '1600 Amphitheatre Parkway Mountain View CA'"),
        regionCode: z.string().optional().describe("ccTLD region, e.g. 'US'"),
        languageCode: z.string().optional().describe("Language, e.g. 'en'"),
    }),
    execute: async ({ googleMapsToken, addressQuery, regionCode, languageCode }) => {
        try {
            const result = await mapsRequest(googleMapsToken, GEOCODE_API_BASE, '/geocode/address', {
                query: { address: addressQuery, regionCode, languageCode },
            });
            if (!result.ok) return { error: 'Failed to geocode address', details: result.error };
            return result.data;
        } catch (error) {
            return { error: 'Error geocoding address', message: error instanceof Error ? error.message : 'Unknown error' };
        }
    },
});

export const geocodeDestinations = tool({
    description:
        'Returns rich destination data (primary place, containing places, sub-destinations, landmarks, entrances, DRIVE/WALK navigation points) for an address, place ID, or coordinates. Provide exactly one lookup.',
    inputSchema: z.object({
        googleMapsToken: googleMapsTokenField,
        place: z.string().optional().describe("Place resource 'places/{placeId}'"),
        addressQuery: z.union([z.string(), z.record(z.any())]).optional().describe('Unstructured address string or structured postal address'),
        locationQuery: z.object({
            location: z.object({ latitude: z.number().min(-90).max(90), longitude: z.number().min(-180).max(180) }),
        }).optional().describe('Coordinates lookup'),
        regionCode: z.string().optional().describe("ccTLD region, e.g. 'US'"),
        languageCode: z.string().optional().describe("Language, e.g. 'en'"),
        travelModes: z.array(z.enum(['DRIVE', 'WALK'])).optional().describe('Filter navigation points'),
    }),
    execute: async ({ googleMapsToken, place, addressQuery, locationQuery, regionCode, languageCode, travelModes }) => {
        try {
            const lookups = [place, addressQuery, locationQuery].filter((v) => v !== undefined);
            if (lookups.length !== 1) return { error: 'Provide exactly one of place, addressQuery, or locationQuery' };
            const body: Record<string, unknown> = {};
            if (place) body.place = place;
            if (addressQuery !== undefined) {
                body.addressQuery = typeof addressQuery === 'string' ? { addressQuery } : { address: addressQuery };
            }
            if (locationQuery) body.locationQuery = locationQuery;
            if (regionCode) body.regionCode = regionCode;
            if (languageCode) body.languageCode = languageCode;
            if (travelModes) body.travelModes = travelModes;
            const result = await mapsRequest(googleMapsToken, GEOCODE_API_BASE, '/geocode/destinations', {
                method: 'POST',
                body,
            });
            if (!result.ok) return { error: 'Failed to geocode destinations', details: result.error };
            return result.data;
        } catch (error) {
            return { error: 'Error geocoding destinations', message: error instanceof Error ? error.message : 'Unknown error' };
        }
    },
});

export const reverseGeocodeLocation = tool({
    description:
        'Converts coordinates to addresses. One coordinate pair can return many results — verify formattedAddress and components before committing.',
    inputSchema: z.object({
        googleMapsToken: googleMapsTokenField,
        latitude: z.number().min(-90).max(90),
        longitude: z.number().min(-180).max(180),
        regionCode: z.string().optional().describe("ccTLD region, e.g. 'US'"),
        languageCode: z.string().optional().describe("BCP-47 language, e.g. 'en'"),
        types: z.array(z.string()).optional().describe('Type tags to keep; others are removed'),
    }),
    execute: async ({ googleMapsToken, latitude, longitude, regionCode, languageCode, types }) => {
        try {
            const result = await mapsRequest(googleMapsToken, GEOCODE_API_BASE, '/geocode/location', {
                query: { location: `${latitude},${longitude}`, regionCode, languageCode, types: types?.join(',') },
            });
            if (!result.ok) return { error: 'Failed to reverse geocode', details: result.error };
            return result.data;
        } catch (error) {
            return { error: 'Error reverse geocoding', message: error instanceof Error ? error.message : 'Unknown error' };
        }
    },
});

export const geocodePlace = tool({
    description:
        'Looks up address and coordinates for a place ID (places/{id} or bare ID).',
    inputSchema: z.object({
        googleMapsToken: googleMapsTokenField,
        placeId: z.string().describe("Place ID, e.g. 'ChIJj61dQgK6j4AR4GeTYWZsKWw' or 'places/...'"),
        regionCode: z.string().optional().describe("ccTLD region, e.g. 'US'"),
        languageCode: z.string().optional().describe("Language, e.g. 'en' (default en)"),
    }),
    execute: async ({ googleMapsToken, placeId, regionCode, languageCode }) => {
        try {
            const place = placeId.startsWith('places/') ? placeId : `places/${placeId}`;
            const result = await mapsRequest(googleMapsToken, GEOCODE_API_BASE, '/geocode/place', {
                query: { place, regionCode, languageCode },
            });
            if (!result.ok) return { error: 'Failed to geocode place', details: result.error };
            return result.data;
        } catch (error) {
            return { error: 'Error geocoding place', message: error instanceof Error ? error.message : 'Unknown error' };
        }
    },
});

export const geocodingApi = tool({
    description:
        'Unified v4beta geocoder: forward (address), reverse (latlng), or place-ID lookup. Provide exactly one of address, latlng, or placeId.',
    inputSchema: z.object({
        googleMapsToken: googleMapsTokenField,
        address: z.string().optional().describe("Street address to geocode, e.g. '1600 Amphitheatre Parkway, Mountain View, CA'"),
        latlng: z.string().optional().describe("Coordinates for reverse geocoding, e.g. '40.714224,-73.961452'"),
        placeId: z.string().optional().describe('Place ID for place geocoding'),
        key: z.string().optional().describe('API key override (uses OAuth by default)'),
        bounds: z.string().optional().describe('Bias viewport sw_lat,sw_lng|ne_lat,ne_lng'),
        region: z.string().optional().describe("Bias ccTLD region, e.g. 'US'"),
        language: z.string().optional().describe("Result language, e.g. 'en'"),
        components: z.string().optional().describe("Restrictive filters, e.g. 'postal_code:94043|country:US'"),
        resultType: z.string().optional().describe("Filter types for reverse/place, e.g. 'street_address|locality'"),
        locationType: z.string().optional().describe("Filter location types, e.g. 'ROOFTOP|RANGE_INTERPOLATED'"),
        extraComputations: z.array(z.enum(['ADDRESS_DESCRIPTORS', 'BUILDING_AND_ENTRANCES'])).optional(),
    }),
    execute: async ({ googleMapsToken, address, latlng, placeId, key, ...rest }) => {
        try {
            const modes = [address, latlng, placeId].filter((v) => v !== undefined);
            if (modes.length !== 1) return { error: 'Provide exactly one of address, latlng, or placeId' };
            const query: Record<string, string | undefined> = { key };
            for (const [k, v] of Object.entries(rest)) if (v !== undefined) query[k] = String(v);
            let path: string;
            if (address) {
                path = '/geocode/address';
                query.address = address;
            } else if (latlng) {
                path = '/geocode/location';
                const [latitude, longitude] = latlng.split(',').map((s) => s.trim());
                query.location = `${latitude},${longitude}`;
            } else {
                path = '/geocode/place';
                query.place = placeId!.startsWith('places/') ? placeId : `places/${placeId}`;
            }
            const result = await mapsRequest(googleMapsToken, GEOCODE_API_BASE, path, { query });
            if (!result.ok) return { error: 'Failed to geocode', details: result.error };
            return result.data;
        } catch (error) {
            return { error: 'Error geocoding', message: error instanceof Error ? error.message : 'Unknown error' };
        }
    },
});
