// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { accuWeatherApiKeyField, awGet } from './client.js';

export const autocompleteLocations = tool({
    description: 'Return location-name suggestions for all locations, cities, or points of interest, optionally restricted to a country.',
    inputSchema: z.object({
        accuWeatherApiKey: accuWeatherApiKeyField,
        query: z.string().min(1).describe('Partial location name to complete, e.g. "New York".'),
        language: z.string().optional().describe('Language code for localized fields (default en-us).'),
        countryCode: z.string().optional().describe('Optional country code restricting suggestions, such as US.'),
        locationType: z
            .enum(['all', 'city', 'point_of_interest'])
            .optional()
            .describe('Kind of suggestion to return: all locations, cities, or points of interest (default all).'),
        includeAliases: z.boolean().optional().describe('Whether to include matching alternate location names (default false).'),
    }),
    execute: async ({ accuWeatherApiKey, query, language, countryCode, locationType = 'all', includeAliases }) => {
        const cc = countryCode ? `/${encodeURIComponent(countryCode)}` : '';
        let path = `/locations/v1${cc}/autocomplete`;
        if (locationType === 'city') path = `/locations/v1/cities${cc}/autocomplete`;
        if (locationType === 'point_of_interest') path = `/locations/v1/poi${cc}/autocomplete`;
        return awGet(path, { apiKey: accuWeatherApiKey, query: { q: query, language, includeAliases } });
    },
});

export const getAdministrativeArea = tool({
    description: 'Return one administrative area by country and administrative-area codes.',
    inputSchema: z.object({
        accuWeatherApiKey: accuWeatherApiKeyField,
        countryCode: z.string().describe('Country code containing the administrative area, e.g. US.'),
        adminCode: z.string().describe('Administrative-area code, e.g. NY.'),
        language: z.string().optional().describe('Language code for localized fields (default en-us).'),
    }),
    execute: async ({ accuWeatherApiKey, countryCode, adminCode, language }) =>
        awGet(`/locations/v1/adminareas/${encodeURIComponent(countryCode)}/${encodeURIComponent(adminCode)}`, {
            apiKey: accuWeatherApiKey,
            query: { language },
        }),
});

export const getCountry = tool({
    description: 'Return one country by AccuWeather region and country codes.',
    inputSchema: z.object({
        accuWeatherApiKey: accuWeatherApiKeyField,
        regionCode: z.string().describe('AccuWeather region code, e.g. NAM.'),
        countryCode: z.string().describe('ISO or Microsoft localization country code, e.g. US.'),
        language: z.string().optional().describe('Language code for localized fields (default en-us).'),
    }),
    execute: async ({ accuWeatherApiKey, regionCode, countryCode, language }) =>
        awGet(`/locations/v1/countries/${encodeURIComponent(regionCode)}/${encodeURIComponent(countryCode)}`, {
            apiKey: accuWeatherApiKey,
            query: { language },
        }),
});

export const getRegion = tool({
    description: 'Return one AccuWeather region by region code.',
    inputSchema: z.object({
        accuWeatherApiKey: accuWeatherApiKeyField,
        regionCode: z.string().describe('AccuWeather region code, e.g. NAM.'),
        language: z.string().optional().describe('Language code for localized fields (default en-us).'),
    }),
    execute: async ({ accuWeatherApiKey, regionCode, language }) =>
        awGet(`/locations/v1/regions/${encodeURIComponent(regionCode)}`, { apiKey: accuWeatherApiKey, query: { language } }),
});

export const getLocation = tool({
    description: 'Return full location metadata for an AccuWeather location key.',
    inputSchema: z.object({
        accuWeatherApiKey: accuWeatherApiKeyField,
        locationKey: z.union([z.number(), z.string()]).describe('AccuWeather location key, e.g. 349727.'),
        details: z.boolean().optional().describe('Whether to include extended location details (default false).'),
        language: z.string().optional().describe('Language code for localized fields (default en-us).'),
    }),
    execute: async ({ accuWeatherApiKey, locationKey, details, language }) =>
        awGet(`/locations/v1/${encodeURIComponent(String(locationKey))}`, { apiKey: accuWeatherApiKey, query: { details, language } }),
});

export const listAdministrativeAreas = tool({
    description: 'Return administrative areas globally or within a country, one provider page at a time.',
    inputSchema: z.object({
        accuWeatherApiKey: accuWeatherApiKeyField,
        language: z.string().optional().describe('Language code for localized fields (default en-us).'),
        adminCode: z.string().optional().describe('Optional administrative-area code used to filter the list, e.g. NY.'),
        countryCode: z.string().optional().describe('Optional country code; when present, list only that country\u2019s administrative areas.'),
        nextCursor: z.string().optional().describe('Opaque cursor returned by a previous call (provider page number); omit for the first page.'),
    }),
    execute: async ({ accuWeatherApiKey, language, adminCode, countryCode, nextCursor }) => {
        const path = countryCode ? `/locations/v1/adminareas/${encodeURIComponent(countryCode)}` : '/locations/v1/adminareas';
        const data = await awGet(path, { apiKey: accuWeatherApiKey, query: { language, offset: nextCursor } });
        if (adminCode && Array.isArray(data)) {
            const needle = adminCode.toUpperCase();
            return data.filter(
                (area: any) =>
                    String(area?.ID ?? '').toUpperCase() === needle ||
                    String(area?.AdministrativeAreaCode ?? '').toUpperCase() === needle,
            );
        }
        return data;
    },
});

export const listCountries = tool({
    description: 'Return countries globally or within a specific AccuWeather region, one provider page at a time.',
    inputSchema: z.object({
        accuWeatherApiKey: accuWeatherApiKeyField,
        language: z.string().optional().describe('Language code for localized country names (default en-us).'),
        regionCode: z.string().optional().describe('Optional AccuWeather region code; when present, list only countries in that region.'),
        countryCode: z.string().optional().describe('Optional ISO or Microsoft localization country code filter, e.g. US.'),
        nextCursor: z.string().optional().describe('Opaque cursor returned by a previous call; omit for the first page.'),
    }),
    execute: async ({ accuWeatherApiKey, language, regionCode, countryCode, nextCursor }) => {
        const path = regionCode ? `/locations/v1/countries/${encodeURIComponent(regionCode)}` : '/locations/v1/countries';
        const data = await awGet(path, { apiKey: accuWeatherApiKey, query: { language, offset: nextCursor } });
        if (countryCode && Array.isArray(data)) {
            const needle = countryCode.toUpperCase();
            return data.filter((country: any) => String(country?.Id ?? country?.ID ?? '').toUpperCase() === needle);
        }
        return data;
    },
});

export const listRegions = tool({
    description: 'Return AccuWeather geographic regions and their codes.',
    inputSchema: z.object({
        accuWeatherApiKey: accuWeatherApiKeyField,
        language: z.string().optional().describe('Language code for localized region names (default en-us).'),
        regionCode: z.string().optional().describe('Optional AccuWeather region code used to filter the region list, e.g. NAM.'),
    }),
    execute: async ({ accuWeatherApiKey, language, regionCode }) =>
        awGet('/locations/v1/regions', { apiKey: accuWeatherApiKey, query: { language, regionCode } }),
});

export const listTopCities = tool({
    description: 'Return top-ranked AccuWeather cities globally or within one region. Global rankings support 50, 100, or 150 results.',
    inputSchema: z.object({
        accuWeatherApiKey: accuWeatherApiKeyField,
        rankingScope: z.enum(['global', 'region']).optional().describe('Rank cities globally or within one AccuWeather region (default global).'),
        regionCode: z.string().optional().describe('AccuWeather region code. Required when rankingScope is "region".'),
        count: z.union([z.literal(50), z.literal(100), z.literal(150)]).optional().describe('Number of cities for global rankings (default 50).'),
        language: z.string().optional().describe('Language code for global rankings (default en-us); omit for regional rankings.'),
        languageId: z.number().int().optional().describe('Numeric AccuWeather language ID for regional rankings (default 1); omit for global rankings.'),
        details: z.boolean().optional().describe('Whether to include extended location details (default false).'),
    }),
    execute: async ({ accuWeatherApiKey, rankingScope = 'global', regionCode, count = 50, language, languageId, details }) => {
        if (rankingScope === 'region') {
            if (!regionCode) return { error: 'regionCode is required when rankingScope is "region".' };
            return awGet(`/locations/v1/topcities/regions/${encodeURIComponent(regionCode)}`, {
                apiKey: accuWeatherApiKey,
                query: { languageID: languageId, details },
            });
        }
        return awGet(`/locations/v1/topcities/${count}`, { apiKey: accuWeatherApiKey, query: { language, details } });
    },
});

export const searchAdministrativeAreas = tool({
    description: 'Search administrative areas by required non-empty name text with optional country and administrative-area code filters.',
    inputSchema: z.object({
        accuWeatherApiKey: accuWeatherApiKeyField,
        query: z.string().min(1).describe('Required non-empty administrative-area name text to search for, e.g. "New York".'),
        language: z.string().optional().describe('Language code for localized fields (default en-us).'),
        adminCode: z.string().optional().describe('Optional administrative-area code filter, e.g. NY.'),
        countryCode: z.string().optional().describe('Optional ISO or Microsoft localization country code that scopes the search, e.g. US.'),
        nextCursor: z.string().optional().describe('Opaque cursor returned by a previous call; omit for the first page.'),
    }),
    execute: async ({ accuWeatherApiKey, query, language, adminCode, countryCode, nextCursor }) => {
        if (!query || !query.trim()) return { error: 'query must be a non-empty string.' };
        return awGet('/locations/v1/adminareas/search', {
            apiKey: accuWeatherApiKey,
            query: { q: query, language, adminCode, countryCode, offset: nextCursor },
        });
    },
});

export const searchCityByIpAddress = tool({
    description: 'Resolve an IPv4 or IPv6 address to an AccuWeather city location.',
    inputSchema: z.object({
        accuWeatherApiKey: accuWeatherApiKeyField,
        ipAddress: z.string().min(1).describe('IPv4 or IPv6 address to resolve, e.g. 38.103.173.150 or 2001:4860:4860::8888.'),
        details: z.boolean().optional().describe('Whether to include extended location details (default false).'),
        language: z.string().optional().describe('Language code for localized fields (default en-us).'),
    }),
    execute: async ({ accuWeatherApiKey, ipAddress, details, language }) =>
        awGet('/locations/v1/cities/ipaddress', { apiKey: accuWeatherApiKey, query: { q: ipAddress, language, details } }),
});

export const searchLocations = tool({
    description:
        'Search cities, general locations, postal codes, or points of interest by text and optional geographic filters such as country and administrative area.',
    inputSchema: z.object({
        accuWeatherApiKey: accuWeatherApiKeyField,
        query: z.string().min(1).describe('Location, city, postal code, or point-of-interest text to search, e.g. "New York".'),
        locationType: z
            .enum(['location', 'city', 'postal_code', 'point_of_interest'])
            .optional()
            .describe('Resource family to search (default location).'),
        language: z.string().optional().describe('Language code for localized fields (default en-us).'),
        details: z.boolean().optional().describe('Whether to include extended location details (default false).'),
        countryCode: z.string().optional().describe('Optional country restriction, e.g. US. Required when adminCode is provided.'),
        adminCode: z.string().optional().describe('Optional administrative-area restriction, e.g. NY. Supported for location, city, and point_of_interest searches.'),
        pointOfInterestType: z.string().optional().describe('Optional provider point-of-interest type filter; valid only when locationType is point_of_interest.'),
        allLanguages: z.boolean().optional().describe('Return point-of-interest matches in all languages; valid only when locationType is point_of_interest.'),
        aliasCount: z.number().int().optional().describe('Number of aliases to return for location or city searches (default 2).'),
        nextCursor: z.string().optional().describe('Opaque cursor returned by a previous location or city search; omit for the first page.'),
    }),
    execute: async ({
        accuWeatherApiKey,
        query,
        locationType = 'location',
        language,
        details,
        countryCode,
        adminCode,
        pointOfInterestType,
        allLanguages,
        aliasCount,
        nextCursor,
    }) => {
        if (!query || !query.trim()) return { error: 'query must be a non-empty string.' };
        if (adminCode && !countryCode) return { error: 'countryCode is required when adminCode is provided.' };

        let path = '/locations/v1/search';
        if (locationType === 'city') {
            path = '/locations/v1/cities/search';
            if (countryCode) {
                path = adminCode
                    ? `/locations/v1/cities/${encodeURIComponent(countryCode)}/${encodeURIComponent(adminCode)}/search`
                    : `/locations/v1/cities/${encodeURIComponent(countryCode)}/search`;
            }
        } else if (locationType === 'postal_code') {
            path = '/locations/v1/postalcodes/search';
        } else if (locationType === 'point_of_interest') {
            path = '/locations/v1/poi/search';
        } else if (countryCode) {
            path = adminCode
                ? `/locations/v1/${encodeURIComponent(countryCode)}/${encodeURIComponent(adminCode)}/search`
                : `/locations/v1/${encodeURIComponent(countryCode)}/search`;
        }

        const queryParams: Record<string, string | number | boolean | undefined> = { q: query, language, details, offset: nextCursor };
        if (locationType === 'postal_code' && countryCode) queryParams.countryCode = countryCode;
        if (locationType === 'point_of_interest') {
            if (countryCode) queryParams.countryCode = countryCode;
            if (adminCode) queryParams.adminCode = adminCode;
            if (pointOfInterestType) queryParams.type = pointOfInterestType;
            if (allLanguages) queryParams.allLanguages = true;
        }
        if (locationType === 'location' || locationType === 'city') {
            if (aliasCount !== undefined) queryParams.aliasCount = aliasCount;
        }
        return awGet(path, { apiKey: accuWeatherApiKey, query: queryParams });
    },
});

export const searchLocationsByCoordinates = tool({
    description: 'Find the nearest general location, city, or point of interest to latitude/longitude coordinates.',
    inputSchema: z.object({
        accuWeatherApiKey: accuWeatherApiKeyField,
        coordinates: z
            .string()
            .min(1)
            .describe('Latitude then longitude in decimal degrees separated by a comma, e.g. "40.779,-73.969".'),
        locationType: z
            .enum(['location', 'city', 'point_of_interest'])
            .optional()
            .describe('Kind of nearby location to return (default location).'),
        language: z.string().optional().describe('Language code for localized fields (default en-us).'),
        details: z.boolean().optional().describe('Whether to include extended location details (default false).'),
        topLevel: z
            .boolean()
            .optional()
            .describe('Prefer the highest-ranked broader location instead of a neighborhood-level match (default false).'),
    }),
    execute: async ({ accuWeatherApiKey, coordinates, locationType = 'location', language, details, topLevel }) => {
        const paths: Record<string, string> = {
            location: '/locations/v1/geoposition/search',
            city: '/locations/v1/cities/geoposition/search',
            point_of_interest: '/locations/v1/poi/geoposition/search',
        };
        return awGet(paths[locationType] ?? paths.location, {
            apiKey: accuWeatherApiKey,
            query: { q: coordinates, language, details, topLevel },
        });
    },
});

export const listNeighboringCities = tool({
    description: 'Return cities near an AccuWeather location key.',
    inputSchema: z.object({
        accuWeatherApiKey: accuWeatherApiKeyField,
        locationKey: z.union([z.number(), z.string()]).describe('Numeric AccuWeather location key, e.g. 349727.'),
        details: z.boolean().optional().describe('Whether to include extended location details (default false).'),
        language: z.string().optional().describe('Language code for localized fields (default en-us).'),
    }),
    execute: async ({ accuWeatherApiKey, locationKey, details, language }) =>
        awGet(`/locations/v1/cities/neighbors/${encodeURIComponent(String(locationKey))}`, {
            apiKey: accuWeatherApiKey,
            query: { language, details },
        }),
});
