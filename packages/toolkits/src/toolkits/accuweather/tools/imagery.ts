// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { accuWeatherApiKeyField, awGet } from './client.js';

export const getRadarSatelliteImagery = tool({
    description: 'Return recent radar and satellite image metadata and URLs for an AccuWeather location at a selected resolution.',
    inputSchema: z.object({
        accuWeatherApiKey: accuWeatherApiKeyField,
        locationKey: z.union([z.number(), z.string()]).describe('AccuWeather location key, e.g. 349727.'),
        resolution: z
            .enum(['480x480', '640x480', '1024x1024'])
            .optional()
            .describe('Requested image dimensions (default 640x480).'),
        language: z.string().optional().describe('Language code for localized fields (default en-us).'),
    }),
    execute: async ({ accuWeatherApiKey, locationKey, resolution = '640x480', language }) =>
        awGet(`/imagery/v1/maps/radsat/${resolution}/${encodeURIComponent(String(locationKey))}`, {
            apiKey: accuWeatherApiKey,
            query: { language },
        }),
});
