// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { accuWeatherApiKeyField, awGet } from './client.js';

const basinField = z.enum(['NP', 'CP', 'SP', 'EP', 'NI', 'SI', 'AL']).optional().describe('Tropical basin code.');
const detailsField = z.boolean().optional().describe('Whether to include extended storm details (default false).');
const languageField = z.string().optional().describe('Language code for localized fields (default en-us).');
const radiiGeometryField = z.boolean().optional().describe('Whether to include wind-radii geometry (default false).');
const includeLandmarksField = z.boolean().optional().describe('Whether to include nearby landmark information (default true).');
const governmentIdField = z.number().int().optional().describe('Government storm or depression ID. Requires basin.');

export const getTropicalStormCurrentPosition = tool({
    description: 'Return the latest observed position of a government-issued tropical storm.',
    inputSchema: z.object({
        accuWeatherApiKey: accuWeatherApiKeyField,
        year: z.number().int().describe('Four-digit storm year, e.g. 2026.'),
        basin: z.enum(['NP', 'CP', 'SP', 'EP', 'NI', 'SI', 'AL']).describe('Tropical basin code, e.g. EP.'),
        governmentId: z.number().int().describe('Government storm or depression ID, e.g. 11.'),
        details: detailsField,
        language: languageField,
        radiiGeometry: radiiGeometryField,
        includeLandmarks: includeLandmarksField,
    }),
    execute: async ({ accuWeatherApiKey, year, basin, governmentId, details, language, radiiGeometry, includeLandmarks = true }) =>
        awGet(`/tropical/v1/gov/storms/${year}/${basin}/${governmentId}/positions/current`, {
            apiKey: accuWeatherApiKey,
            query: { details, language, radiigeometry: radiiGeometry, includelandmarks: includeLandmarks },
        }),
});

export const listActiveTropicalStorms = tool({
    description: 'Return active government-issued tropical storms globally, by basin, or by basin and government storm ID.',
    inputSchema: z.object({
        accuWeatherApiKey: accuWeatherApiKeyField,
        basin: basinField,
        governmentId: governmentIdField,
    }),
    execute: async ({ accuWeatherApiKey, basin, governmentId }) => {
        if (governmentId !== undefined && !basin) return { error: 'basin is required when governmentId is provided.' };
        return awGet('/tropical/v1/gov/storms/active', {
            apiKey: accuWeatherApiKey,
            query: { basinID: basin, governmentID: governmentId },
        });
    },
});

export const listTropicalStormForecasts = tool({
    description: 'Return forecast positions and intensity for a government-issued tropical storm.',
    inputSchema: z.object({
        accuWeatherApiKey: accuWeatherApiKeyField,
        year: z.number().int().describe('Four-digit storm year, e.g. 2026.'),
        basin: z.enum(['NP', 'CP', 'SP', 'EP', 'NI', 'SI', 'AL']).describe('Tropical basin code, e.g. EP.'),
        governmentId: z.number().int().describe('Government storm or depression ID, e.g. 11.'),
        details: detailsField,
        language: languageField,
        radiiGeometry: radiiGeometryField,
        windowGeometry: z.boolean().optional().describe('Whether to include forecast uncertainty-window geometry (default false).'),
    }),
    execute: async ({ accuWeatherApiKey, year, basin, governmentId, details, language, radiiGeometry, windowGeometry }) =>
        awGet(`/tropical/v1/gov/storms/${year}/${basin}/${governmentId}/forecasts`, {
            apiKey: accuWeatherApiKey,
            query: { details, language, radiigeometry: radiiGeometry, windowgeometry: windowGeometry },
        }),
});

export const listTropicalStormPositions = tool({
    description: 'Return the observed position history of a government-issued tropical storm.',
    inputSchema: z.object({
        accuWeatherApiKey: accuWeatherApiKeyField,
        year: z.number().int().describe('Four-digit storm year, e.g. 2026.'),
        basin: z.enum(['NP', 'CP', 'SP', 'EP', 'NI', 'SI', 'AL']).describe('Tropical basin code, e.g. EP.'),
        governmentId: z.number().int().describe('Government storm or depression ID, e.g. 11.'),
        details: detailsField,
        language: languageField,
        radiiGeometry: radiiGeometryField,
        includeLandmarks: includeLandmarksField,
    }),
    execute: async ({ accuWeatherApiKey, year, basin, governmentId, details, language, radiiGeometry, includeLandmarks = true }) =>
        awGet(`/tropical/v1/gov/storms/${year}/${basin}/${governmentId}/positions`, {
            apiKey: accuWeatherApiKey,
            query: { details, language, radiigeometry: radiiGeometry, includelandmarks: includeLandmarks },
        }),
});

export const listTropicalStormsByYear = tool({
    description: 'Return government-issued tropical storms for a year, optionally filtered by basin and government storm ID.',
    inputSchema: z.object({
        accuWeatherApiKey: accuWeatherApiKeyField,
        year: z.number().int().describe('Four-digit storm year, e.g. 2024.'),
        basin: basinField,
        governmentId: governmentIdField,
        details: detailsField,
        language: languageField,
    }),
    execute: async ({ accuWeatherApiKey, year, basin, governmentId, details, language }) => {
        if (governmentId !== undefined && !basin) return { error: 'basin is required when governmentId is provided.' };
        let path = `/tropical/v1/gov/storms/${year}`;
        if (basin) path += `/${basin}`;
        if (governmentId !== undefined) path += `/${governmentId}`;
        return awGet(path, { apiKey: accuWeatherApiKey, query: { details, language } });
    },
});

export const listTropicalStormStatuses = tool({
    description: 'Return government-issued tropical storm status categories and wind-speed definitions globally or for one basin.',
    inputSchema: z.object({
        accuWeatherApiKey: accuWeatherApiKeyField,
        basin: basinField,
        details: detailsField,
    }),
    execute: async ({ accuWeatherApiKey, basin, details }) =>
        awGet(`/tropical/v1/gov/storms/statuses${basin ? `/${basin}` : ''}`, { apiKey: accuWeatherApiKey, query: { details } }),
});
