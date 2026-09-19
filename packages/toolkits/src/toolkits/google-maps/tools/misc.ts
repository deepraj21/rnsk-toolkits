// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { AERIAL_API_BASE, googleMapsTokenField, mapsRequest } from './client.js';

export const geolocateDevice = tool({
    description:
        'Estimates device location from cell towers and WiFi (2+ APs recommended). Falls back to IP unless considerIp=false.',
    inputSchema: z.object({
        googleMapsToken: googleMapsTokenField,
        key: z.string().optional().describe('API key (Geolocation prefers key auth)'),
        homeMobileCountryCode: z.number().min(0).max(999).optional(),
        homeMobileNetworkCode: z.number().min(0).max(32767).optional(),
        radioType: z.enum(['gsm', 'cdma', 'wcdma', 'lte', 'nr']).optional().describe("Radio type (default 'gsm')"),
        carrier: z.string().optional(),
        considerIp: z.boolean().optional().describe('IP fallback (default true)'),
        cellTowers: z.array(z.record(z.any())).optional().describe('Cell towers with cellId/MCC/MNC/LAC'),
        wifiAccessPoints: z.array(z.object({
            macAddress: z.string().describe('Colon-separated MAC'),
            signalStrength: z.number().min(-128).max(-10).optional().describe('dBm (-128 to -10)'),
            age: z.number().min(0).optional(),
            channel: z.number().min(1).optional(),
            signalToNoiseRatio: z.number().optional(),
        })).optional(),
    }),
    execute: async ({ googleMapsToken, key, ...body }) => {
        try {
            const result = await mapsRequest(googleMapsToken, 'https://www.googleapis.com', '/geolocation/v1/geolocate', {
                method: 'POST',
                query: { key },
                body,
            });
            if (!result.ok) return { error: 'Failed to geolocate device', details: result.error };
            return result.data;
        } catch (error) {
            return { error: 'Error geolocating device', message: error instanceof Error ? error.message : 'Unknown error' };
        }
    },
});

export const getTimeZone = tool({
    description:
        'Gets time zone ID, UTC/DST offsets, and localized name for coordinates at a Unix timestamp (DST-aware).',
    inputSchema: z.object({
        googleMapsToken: googleMapsTokenField,
        location: z.string().describe("Coordinates 'lat,lng', e.g. '39.6034810,-119.6822510'"),
        timestamp: z.number().describe('Unix epoch seconds for DST evaluation'),
        language: z.string().optional().describe("Language for the zone name, e.g. 'en'"),
        key: z.string().optional().describe('API key alternative to Bearer auth'),
    }),
    execute: async ({ googleMapsToken, location, timestamp, language, key }) => {
        try {
            const result = await mapsRequest(googleMapsToken, 'https://maps.googleapis.com', '/maps/api/timezone/json', {
                query: { location, timestamp, language, key },
            });
            if (!result.ok) return { error: 'Failed to get time zone', details: result.error };
            return result.data;
        } catch (error) {
            return { error: 'Error getting time zone', message: error instanceof Error ? error.message : 'Unknown error' };
        }
    },
});

const embedParams = z.record(z.any()).optional().describe('Mode params: zoom, center, region, maptype, language plus mode-specific fields');

export const embedGoogleMap = tool({
    description:
        'Builds a public Maps Embed URL + iframe for place/view/directions/streetview/search. API-key only (no OAuth) — pass apiKey. No API call is made.',
    inputSchema: z.object({
        mode: z.enum(['place', 'view', 'directions', 'streetview', 'search']).describe('Embed mode'),
        apiKey: z.string().describe('Maps API key (Embed requires key auth)'),
        placeParams: z.object({ q: z.string().describe('Place name, address, plus code, or place_id:...') }).catchall(z.unknown()).optional().describe("Place mode (q required)"),
        viewParams: z.object({ center: z.string().describe("Center 'lat,lng' (required)") }).catchall(z.unknown()).optional().describe('View mode'),
        directionsParams: z.object({ origin: z.string(), destination: z.string() }).catchall(z.unknown()).optional().describe('Directions mode (origin + destination required)'),
        streetviewParams: z.object({}).catchall(z.unknown()).optional().describe("Streetview mode (location or pano required)"),
        searchParams: z.object({ q: z.string().describe('Search term (required)') }).catchall(z.unknown()).optional().describe('Search mode'),
    }),
    execute: async ({ mode, apiKey, placeParams, viewParams, directionsParams, streetviewParams, searchParams }) => {
        try {
            const modeParams = { place: placeParams, view: viewParams, directions: directionsParams, streetview: streetviewParams, search: searchParams }[mode];
            if (!modeParams) return { error: `Parameters for mode '${mode}' are required` };
            const required: Record<string, string[]> = {
                place: ['q'],
                view: ['center'],
                directions: ['origin', 'destination'],
                streetview: [],
                search: ['q'],
            };
            for (const field of required[mode]) {
                if ((modeParams as Record<string, unknown>)[field] === undefined) {
                    return { error: `Mode '${mode}' requires '${field}'` };
                }
            }
            if (mode === 'streetview' && (modeParams as Record<string, unknown>).location === undefined && (modeParams as Record<string, unknown>).pano === undefined) {
                return { error: "Streetview mode requires 'location' or 'pano'" };
            }
            const search = new URLSearchParams({ key: apiKey });
            for (const [k, v] of Object.entries(modeParams as Record<string, unknown>)) {
                if (v !== undefined) search.set(k, String(v));
            }
            const iframeUrl = `https://www.google.com/maps/embed/v1/${mode}?${search.toString()}`;
            return {
                iframeUrl,
                htmlEmbedCode: `<iframe width="600" height="450" style="border:0" loading="lazy" allowfullscreen referrerpolicy="no-referrer-when-downgrade" src="${iframeUrl}"></iframe>`,
            };
        } catch (error) {
            return { error: 'Error building embed URL', message: error instanceof Error ? error.message : 'Unknown error' };
        }
    },
});

export const lookupAerialVideo = tool({
    description:
        'Looks up an aerial video by US address or video ID. Receiving a video is billable; poll state until ACTIVE for URIs.',
    inputSchema: z.object({
        googleMapsToken: googleMapsTokenField,
        address: z.string().optional().describe('US postal address (exclusive with videoId)'),
        videoId: z.string().optional().describe('ID from renderVideo (exclusive with address)'),
        key: z.string().optional().describe('API key alternative to Bearer auth'),
    }),
    execute: async ({ googleMapsToken, address, videoId, key }) => {
        try {
            if (!!address === !!videoId) return { error: 'Provide exactly one of address or videoId' };
            const result = await mapsRequest(googleMapsToken, AERIAL_API_BASE, '/videos:lookupVideo', {
                query: { address, videoId, key },
            });
            if (!result.ok) return { error: 'Failed to look up aerial video', details: result.error };
            return result.data;
        } catch (error) {
            return { error: 'Error looking up aerial video', message: error instanceof Error ? error.message : 'Unknown error' };
        }
    },
});

export const renderAerialVideo = tool({
    description:
        'Starts an aerial video render for a US address. Returns a videoId — poll lookupVideo until ACTIVE (takes up to hours).',
    inputSchema: z.object({
        googleMapsToken: googleMapsTokenField,
        address: z.string().describe('US postal address with street, city, state, postal code'),
        key: z.string().optional().describe('API key alternative to Bearer auth'),
    }),
    execute: async ({ googleMapsToken, address, key }) => {
        try {
            const result = await mapsRequest(googleMapsToken, AERIAL_API_BASE, '/videos:renderVideo', {
                method: 'POST',
                query: { key },
                body: { address },
            });
            if (!result.ok) return { error: 'Failed to render aerial video', details: result.error };
            return result.data;
        } catch (error) {
            return { error: 'Error rendering aerial video', message: error instanceof Error ? error.message : 'Unknown error' };
        }
    },
});
