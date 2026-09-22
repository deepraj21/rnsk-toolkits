// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { accuWeatherApiKeyField, awGet } from './client.js';

export const getTranslationGroup = tool({
    description: 'Return translated strings for one AccuWeather translation group.',
    inputSchema: z.object({
        accuWeatherApiKey: accuWeatherApiKeyField,
        groupId: z.number().int().describe('Numeric identifier of the translation group to retrieve, e.g. 1.'),
        language: z.string().optional().describe('Language code for the translated strings (default en-us).'),
    }),
    execute: async ({ accuWeatherApiKey, groupId, language }) =>
        awGet(`/translations/v1/groups/${groupId}`, { apiKey: accuWeatherApiKey, query: { language } }),
});

export const listTranslationGroups = tool({
    description: 'Return available AccuWeather translation groups and their identifiers.',
    inputSchema: z.object({
        accuWeatherApiKey: accuWeatherApiKeyField,
        language: z.string().optional().describe('Language code for localized translation group names (default en-us).'),
    }),
    execute: async ({ accuWeatherApiKey, language }) =>
        awGet('/translations/v1/groups', { apiKey: accuWeatherApiKey, query: { language } }),
});

export const listSupportedLanguages = tool({
    description: 'Return AccuWeather-supported languages with numeric IDs and language codes.',
    inputSchema: z.object({
        accuWeatherApiKey: accuWeatherApiKeyField,
        format: z.string().optional().describe('Response format; the provider currently returns JSON.'),
    }),
    execute: async ({ accuWeatherApiKey, format }) =>
        awGet('/translations/v1/languages', { apiKey: accuWeatherApiKey, query: { format } }),
});

export const resolveLanguageIdentifier = tool({
    description: 'Convert an AccuWeather language code to its numeric ID or a numeric language ID to its code.',
    inputSchema: z.object({
        accuWeatherApiKey: accuWeatherApiKeyField,
        identifierType: z.enum(['code', 'id']).describe('Whether to resolve a language code or a numeric language ID.'),
        languageCode: z.string().optional().describe('AccuWeather language code to resolve when identifierType is "code", e.g. en-us.'),
        languageId: z.number().int().optional().describe('Positive AccuWeather language ID to resolve when identifierType is "id", e.g. 1.'),
    }),
    execute: async ({ accuWeatherApiKey, identifierType, languageCode, languageId }) => {
        if (identifierType === 'code') {
            if (!languageCode) return { error: 'languageCode is required when identifierType is "code".' };
            return awGet(`/translations/v1/languages/code/${encodeURIComponent(languageCode)}`, { apiKey: accuWeatherApiKey });
        }
        if (languageId === undefined) return { error: 'languageId is required when identifierType is "id".' };
        return awGet(`/translations/v1/languages/id/${languageId}`, { apiKey: accuWeatherApiKey });
    },
});
