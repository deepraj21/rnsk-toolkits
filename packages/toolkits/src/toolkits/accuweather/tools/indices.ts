// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { accuWeatherApiKeyField, awGet } from './client.js';

export const getDailyIndices = tool({
    description: 'Return 1, 5, 10, or 15-day lifestyle-index forecasts for all indices, one group, or one index at an AccuWeather location.',
    inputSchema: z.object({
        accuWeatherApiKey: accuWeatherApiKeyField,
        locationKey: z.union([z.number(), z.string()]).describe('AccuWeather location key, e.g. 349727.'),
        days: z.union([z.literal(1), z.literal(5), z.literal(10), z.literal(15)]).optional().describe('Forecast horizon in days (default 5).'),
        selection: z.enum(['all', 'group', 'index']).optional().describe('Return all indices, one index group, or one specific index (default all).'),
        groupId: z.number().int().optional().describe('Index group ID. Required when selection is "group".'),
        indexId: z.number().int().optional().describe('Nonzero index ID, including provider-defined negative IDs. Required when selection is "index".'),
        details: z.boolean().optional().describe('Whether to include extended index forecast details (default false).'),
        language: z.string().optional().describe('Language code for localized fields (default en-us).'),
    }),
    execute: async ({ accuWeatherApiKey, locationKey, days = 5, selection = 'all', groupId, indexId, details, language }) => {
        let path = `/indices/v1/daily/${days}day/${encodeURIComponent(String(locationKey))}`;
        if (selection === 'group') {
            if (groupId === undefined) return { error: 'groupId is required when selection is "group".' };
            path += `/groups/${groupId}`;
        } else if (selection === 'index') {
            if (indexId === undefined) return { error: 'indexId is required when selection is "index".' };
            path += `/${indexId}`;
        }
        return awGet(path, { apiKey: accuWeatherApiKey, query: { details, language } });
    },
});

export const getIndex = tool({
    description: 'Return metadata for one AccuWeather lifestyle index.',
    inputSchema: z.object({
        accuWeatherApiKey: accuWeatherApiKeyField,
        indexId: z.number().int().describe('Lifestyle-index ID, e.g. 29 (not -1).'),
        language: z.string().optional().describe('Language code for localized index metadata (default en-us).'),
    }),
    execute: async ({ accuWeatherApiKey, indexId, language }) =>
        awGet(`/indices/v1/daily/${indexId}`, { apiKey: accuWeatherApiKey, query: { language } }),
});

export const getIndexGroup = tool({
    description: 'Return the lifestyle indices belonging to one AccuWeather index group.',
    inputSchema: z.object({
        accuWeatherApiKey: accuWeatherApiKeyField,
        groupId: z.number().int().describe('Lifestyle-index group ID, e.g. 1.'),
        language: z.string().optional().describe('Language code for localized index metadata (default en-us).'),
    }),
    execute: async ({ accuWeatherApiKey, groupId, language }) =>
        awGet(`/indices/v1/daily/groups/${groupId}`, { apiKey: accuWeatherApiKey, query: { language } }),
});

export const listIndexGroups = tool({
    description: 'Return lifestyle-index groups and their identifiers.',
    inputSchema: z.object({
        accuWeatherApiKey: accuWeatherApiKeyField,
        language: z.string().optional().describe('Language code for localized index-group fields (default en-us).'),
    }),
    execute: async ({ accuWeatherApiKey, language }) =>
        awGet('/indices/v1/daily/groups', { apiKey: accuWeatherApiKey, query: { language } }),
});

export const listIndices = tool({
    description: 'Return all supported lifestyle indices and their identifiers.',
    inputSchema: z.object({
        accuWeatherApiKey: accuWeatherApiKeyField,
        language: z.string().optional().describe('Language code for localized index metadata (default en-us).'),
    }),
    execute: async ({ accuWeatherApiKey, language }) =>
        awGet('/indices/v1/daily', { apiKey: accuWeatherApiKey, query: { language } }),
});
