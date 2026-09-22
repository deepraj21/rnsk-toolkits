// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { accuWeatherApiKeyField, awGet } from './client.js';

export const getDailyForecast = tool({
    description: 'Return a 1, 5, 7, 10, or 15-day forecast for a location key.',
    inputSchema: z.object({
        accuWeatherApiKey: accuWeatherApiKeyField,
        locationKey: z.union([z.number(), z.string()]).describe('AccuWeather location key, e.g. 349727.'),
        days: z
            .union([z.literal(1), z.literal(5), z.literal(7), z.literal(10), z.literal(15)])
            .optional()
            .describe('Number of forecast days; selects a documented fixed horizon (default 5).'),
        metric: z.boolean().optional().describe('Whether to return metric units instead of imperial units (default false).'),
        details: z.boolean().optional().describe('Whether to include extended forecast details (default false).'),
        language: z.string().optional().describe('Language code for localized fields (default en-us).'),
    }),
    execute: async ({ accuWeatherApiKey, locationKey, days = 5, metric, details, language }) =>
        awGet(`/forecasts/v1/daily/${days}day/${encodeURIComponent(String(locationKey))}`, {
            apiKey: accuWeatherApiKey,
            query: { metric, details, language },
        }),
});

export const getHourlyForecast = tool({
    description: 'Return a 1, 12, 24, 72, or 120-hour forecast for a location key.',
    inputSchema: z.object({
        accuWeatherApiKey: accuWeatherApiKeyField,
        locationKey: z.union([z.number(), z.string()]).describe('AccuWeather location key, e.g. 349727.'),
        hours: z
            .union([z.literal(1), z.literal(12), z.literal(24), z.literal(72), z.literal(120)])
            .optional()
            .describe('Number of forecast hours; selects a documented fixed horizon (default 12).'),
        metric: z.boolean().optional().describe('Whether to return metric units instead of imperial units (default false).'),
        details: z.boolean().optional().describe('Whether to include extended forecast details (default false).'),
        language: z.string().optional().describe('Language code for localized fields (default en-us).'),
    }),
    execute: async ({ accuWeatherApiKey, locationKey, hours = 12, metric, details, language }) =>
        awGet(`/forecasts/v1/hourly/${hours}hour/${encodeURIComponent(String(locationKey))}`, {
            apiKey: accuWeatherApiKey,
            query: { metric, details, language },
        }),
});
