// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { ROUTES_API_BASE, googleMapsTokenField, mapsRequest } from './client.js';

const waypoint = z.object({
    address: z.string().optional().describe('Address string'),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
});

function toRouteWaypoint(w: { address?: string; latitude?: number; longitude?: number }): Record<string, unknown> {
    if (w.address) return { address: w.address };
    return { location: { latLng: { latitude: w.latitude, longitude: w.longitude } } };
}

export const computeRouteMatrix = tool({
    description:
        'Computes distance/duration for every origin×destination pair (cap 625 elements — chunk larger sets). Map results via originIndex/destinationIndex; only trust condition ROUTE_EXISTS.',
    inputSchema: z.object({
        googleMapsToken: googleMapsTokenField,
        origins: z.array(waypoint).min(1).describe('Origins as addresses or lat/lng'),
        destinations: z.array(waypoint).min(1).describe('Destinations as addresses or lat/lng'),
        travelMode: z.enum(['DRIVE', 'BICYCLE', 'WALK', 'TWO_WHEELER', 'TRANSIT']).optional().describe('Default DRIVE'),
        routingPreference: z.enum(['ROUTING_PREFERENCE_UNSPECIFIED', 'TRAFFIC_UNAWARE', 'TRAFFIC_AWARE', 'TRAFFIC_AWARE_OPTIMAL']).optional().describe('Default TRAFFIC_AWARE'),
        languageCode: z.string().optional().describe("BCP-47 language (default 'en-US')"),
        units: z.enum(['METRIC', 'IMPERIAL']).optional().describe('Display units only; distanceMeters stays metric (default IMPERIAL)'),
        fieldMask: z.string().optional().describe("Response fields (default 'originIndex,destinationIndex,duration,distanceMeters,status,condition')"),
    }),
    execute: async ({ googleMapsToken, origins, destinations, travelMode, routingPreference, languageCode, units, fieldMask }) => {
        try {
            if (origins.length * destinations.length > 625) {
                return { error: `Matrix of ${origins.length * destinations.length} exceeds the 625-element cap — chunk into smaller sets` };
            }
            const body: Record<string, unknown> = {
                origins: origins.map(toRouteWaypoint),
                destinations: destinations.map(toRouteWaypoint),
            };
            if (travelMode) body.travelMode = travelMode;
            if (routingPreference) body.routingPreference = routingPreference;
            if (languageCode) body.languageCode = languageCode;
            if (units) body.units = units;
            const result = await mapsRequest(googleMapsToken, ROUTES_API_BASE, '/distanceMatrix/v2:computeRouteMatrix', {
                method: 'POST',
                headers: { 'X-Goog-FieldMask': fieldMask ?? 'originIndex,destinationIndex,duration,distanceMeters,status,condition' },
                body,
            });
            if (!result.ok) return { error: 'Failed to compute route matrix', details: result.error };
            return result.data;
        } catch (error) {
            return { error: 'Error computing route matrix', message: error instanceof Error ? error.message : 'Unknown error' };
        }
    },
});

export const getRoute = tool({
    description:
        'Computes routes between two addresses/coordinates with waypoints and travel preferences. Duration strings end in "s" (e.g. "4557s") — parse before display.',
    inputSchema: z.object({
        googleMapsToken: googleMapsTokenField,
        originAddress: z.string().describe("Origin address or 'lat,lng'"),
        destinationAddress: z.string().describe("Destination address or 'lat,lng'"),
        travelMode: z.enum(['DRIVE', 'BICYCLE', 'WALK', 'TWO_WHEELER', 'TRANSIT']).optional().describe('Default DRIVE'),
        routingPreference: z.enum(['ROUTING_PREFERENCE_UNSPECIFIED', 'TRAFFIC_UNAWARE', 'TRAFFIC_AWARE', 'TRAFFIC_AWARE_OPTIMAL']).optional(),
        languageCode: z.string().optional().describe("BCP-47 language (default 'en-US')"),
        units: z.enum(['METRIC', 'IMPERIAL']).optional().describe('Display units only (default IMPERIAL)'),
        avoidTolls: z.boolean().optional(),
        avoidHighways: z.boolean().optional(),
        avoidFerries: z.boolean().optional(),
        computeAlternativeRoutes: z.boolean().optional(),
        fieldMask: z.string().optional().describe("Response fields (default 'routes.distanceMeters,routes.duration')"),
    }),
    execute: async ({ googleMapsToken, originAddress, destinationAddress, fieldMask, ...opts }) => {
        try {
            const body: Record<string, unknown> = {
                origin: { address: originAddress },
                destination: { address: destinationAddress },
            };
            for (const [k, v] of Object.entries(opts)) if (v !== undefined) body[k] = v;
            const result = await mapsRequest(googleMapsToken, ROUTES_API_BASE, '/directions/v2:computeRoutes', {
                method: 'POST',
                headers: { 'X-Goog-FieldMask': fieldMask ?? 'routes.distanceMeters,routes.duration' },
                body,
            });
            if (!result.ok) return { error: 'Failed to get route', details: result.error };
            return { responseData: result.data };
        } catch (error) {
            return { error: 'Error getting route', message: error instanceof Error ? error.message : 'Unknown error' };
        }
    },
});
