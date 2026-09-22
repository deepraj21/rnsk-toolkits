// @ts-nocheck
import { z } from 'zod';

export const ACCUWEATHER_BASE = 'https://dataservice.accuweather.com';

export const accuWeatherApiKeyField = z
    .string()
    .optional()
    .describe(
        'AccuWeather API key. Injected at runtime — create one at developer.accuweather.com. Sent as Authorization: Bearer <key> and as the apikey query parameter.',
    );

export function missingKey() {
    return { error: 'AccuWeather API key is required. Connect AccuWeather first.' };
}

export interface AccuWeatherOptions {
    query?: Record<string, string | number | boolean | undefined>;
    apiKey?: string;
}

/**
 * GET a documented AccuWeather route. The key is attached twice on purpose:
 * current developer docs authenticate with `Authorization: Bearer`, while
 * enterprise-style endpoints read `?apikey=`. Sending both works everywhere.
 */
export async function awGet(path: string, options: AccuWeatherOptions = {}) {
    if (!options.apiKey) return missingKey();
    const url = new URL(`${ACCUWEATHER_BASE}${path}`);
    for (const [key, value] of Object.entries(options.query ?? {})) {
        if (value !== undefined) url.searchParams.set(key, String(value));
    }
    url.searchParams.set('apikey', options.apiKey);
    try {
        const response = await fetch(url.toString(), {
            headers: {
                Accept: 'application/json',
                Authorization: `Bearer ${options.apiKey}`,
            },
        });
        const text = await response.text();
        let data: any = {};
        if (text) {
            try {
                data = JSON.parse(text);
            } catch {
                data = { raw: text };
            }
        }
        if (!response.ok) return { error: 'AccuWeather API request failed', status: response.status, details: data };
        return data;
    } catch (error) {
        return { error: 'Error calling AccuWeather API', message: error instanceof Error ? error.message : 'Unknown error' };
    }
}
