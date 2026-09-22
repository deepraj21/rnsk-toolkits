// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { accuWeatherApiKeyField, awGet } from './client.js';

export const getCurrentConditions = tool({
    description: 'Return current weather observations for an AccuWeather location key, optionally including extended details and weather photos.',
    inputSchema: z.object({
        accuWeatherApiKey: accuWeatherApiKeyField,
        locationKey: z.union([z.number(), z.string()]).describe('AccuWeather location key, e.g. 349727.'),
        details: z.boolean().optional().describe('Whether to include extended observation details (default false).'),
        getPhotos: z.boolean().optional().describe('Whether to include photos representing the location and current weather (default false).'),
        language: z.string().optional().describe('Language code for localized fields (default en-us).'),
    }),
    execute: async ({ accuWeatherApiKey, locationKey, details, getPhotos, language }) =>
        awGet(`/currentconditions/v1/${encodeURIComponent(String(locationKey))}`, {
            apiKey: accuWeatherApiKey,
            query: { details, getPhotos, language },
        }),
});

export const getHistoricalCurrentConditions = tool({
    description: 'Return the past 6 or 24 hours of current-condition observations for an AccuWeather location key.',
    inputSchema: z.object({
        accuWeatherApiKey: accuWeatherApiKeyField,
        locationKey: z.union([z.number(), z.string()]).describe('AccuWeather location key, e.g. 349727.'),
        hours: z.union([z.literal(6), z.literal(24)]).optional().describe('Historical window in hours: 6 or 24 (default 6).'),
        details: z.boolean().optional().describe('Whether to include extended observation details (default false).'),
        getPhotos: z.boolean().optional().describe('Whether to include representative weather photos (default false).'),
        language: z.string().optional().describe('Language code for localized fields (default en-us).'),
    }),
    execute: async ({ accuWeatherApiKey, locationKey, hours = 6, details, getPhotos, language }) => {
        const suffix = hours === 24 ? '/historical/24' : '/historical';
        return awGet(`/currentconditions/v1/${encodeURIComponent(String(locationKey))}${suffix}`, {
            apiKey: accuWeatherApiKey,
            query: { details, getPhotos, language },
        });
    },
});

export const listTopCityConditions = tool({
    description: 'Return current weather conditions for a requested number of globally ranked cities.',
    inputSchema: z.object({
        accuWeatherApiKey: accuWeatherApiKeyField,
        listLength: z.union([z.literal(50), z.literal(100), z.literal(150)]).describe('Number of globally ranked city condition records: 50, 100, or 150.'),
        language: z.string().optional().describe('Language code for localized weather text (default en-us).'),
    }),
    execute: async ({ accuWeatherApiKey, listLength, language }) =>
        awGet(`/currentconditions/v1/topcities/${listLength}`, { apiKey: accuWeatherApiKey, query: { language } }),
});
