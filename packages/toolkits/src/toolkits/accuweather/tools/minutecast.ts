// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { accuWeatherApiKeyField, awGet } from './client.js';

export const getMinuteCastForecast = tool({
    description: 'Return minute-by-minute precipitation conditions for latitude/longitude coordinates.',
    inputSchema: z.object({
        accuWeatherApiKey: accuWeatherApiKeyField,
        coordinates: z
            .string()
            .min(1)
            .describe('Latitude then longitude in decimal degrees separated by a comma, e.g. "40.779,-73.969".'),
        details: z.boolean().optional().describe('Whether to include detailed minute intervals when available (default false).'),
        language: z.string().optional().describe('Language code for localized precipitation phrases (default en).'),
    }),
    execute: async ({ accuWeatherApiKey, coordinates, details, language }) =>
        awGet('/forecasts/v1/minute', { apiKey: accuWeatherApiKey, query: { q: coordinates, language, details } }),
});

export const listMinuteCastColorCodes = tool({
    description: 'Return full or simplified color-code metadata used in MinuteCast precipitation output.',
    inputSchema: z.object({
        accuWeatherApiKey: accuWeatherApiKeyField,
        detailLevel: z.enum(['full', 'simple']).optional().describe('Return the full or simplified MinuteCast color-code table (default full).'),
    }),
    execute: async ({ accuWeatherApiKey, detailLevel = 'full' }) =>
        awGet(detailLevel === 'simple' ? '/forecasts/v1/minute/colors/simple' : '/forecasts/v1/minute/colors', {
            apiKey: accuWeatherApiKey,
        }),
});
