// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { accuWeatherApiKeyField, awGet } from './client.js';

export const getLightningForecast = tool({
    description:
        'Return forecast lightning probabilities for latitude/longitude coordinates. Coverage is latitude 20 to 55 and longitude -130 to -60 (North America).',
    inputSchema: z.object({
        accuWeatherApiKey: accuWeatherApiKeyField,
        coordinates: z
            .string()
            .min(1)
            .describe('Latitude then longitude in decimal degrees separated by a comma, e.g. "40.779,-73.969".'),
    }),
    execute: async ({ accuWeatherApiKey, coordinates }) =>
        awGet('/lightning/v1/forecasts/geoposition', { apiKey: accuWeatherApiKey, query: { q: coordinates } }),
});

export const listRecentLightningStrikes = tool({
    description: 'Return recent lightning strikes within 1 to 60 miles of latitude/longitude coordinates as a GeoJSON FeatureCollection.',
    inputSchema: z.object({
        accuWeatherApiKey: accuWeatherApiKeyField,
        coordinates: z
            .string()
            .min(1)
            .describe('Center latitude then longitude in decimal degrees separated by a comma, e.g. "40.779,-73.969".'),
        minutes: z
            .union([z.literal(5), z.literal(15), z.literal(30), z.literal(60), z.literal(120)])
            .optional()
            .describe('Lookback interval in minutes (default 15).'),
        distanceRadius: z.number().int().min(1).max(60).optional().describe('Search radius in miles, from 1 through 60 (default 5).'),
    }),
    execute: async ({ accuWeatherApiKey, coordinates, minutes = 15, distanceRadius = 5 }) =>
        awGet(`/lightning/v1/${minutes}min/geoposition/radius.geojson`, {
            apiKey: accuWeatherApiKey,
            query: { q: coordinates, distanceRadius },
        }),
});
