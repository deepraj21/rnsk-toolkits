// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { accuWeatherApiKeyField, awGet } from './client.js';

export const listWeatherAlarms = tool({
    description: 'Return threshold-based weather alarms for the next 1, 5, 10, or 15 days at an AccuWeather location.',
    inputSchema: z.object({
        accuWeatherApiKey: accuWeatherApiKeyField,
        locationKey: z.union([z.number(), z.string()]).describe('AccuWeather location key, e.g. 349727.'),
        days: z.union([z.literal(1), z.literal(5), z.literal(10), z.literal(15)]).optional().describe('Alarm forecast horizon in days (default 5).'),
        language: z.string().optional().describe('Language code for localized fields (default en-us).'),
    }),
    execute: async ({ accuWeatherApiKey, locationKey, days = 5, language }) =>
        awGet(`/alarms/v1/${days}day/${encodeURIComponent(String(locationKey))}`, { apiKey: accuWeatherApiKey, query: { language } }),
});

export const listWeatherAlerts = tool({
    description: 'Return active government-issued weather alerts for a location key.',
    inputSchema: z.object({
        accuWeatherApiKey: accuWeatherApiKeyField,
        locationKey: z.union([z.number(), z.string()]).describe('AccuWeather location key, e.g. 349727.'),
        details: z.boolean().optional().describe('Whether to include extended alert details, including areas and text (default false).'),
        language: z.string().optional().describe('Language code for localized alert fields (default en-us).'),
    }),
    execute: async ({ accuWeatherApiKey, locationKey, details, language }) =>
        awGet(`/alerts/v1/${encodeURIComponent(String(locationKey))}`, { apiKey: accuWeatherApiKey, query: { details, language } }),
});
