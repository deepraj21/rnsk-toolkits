// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { nasaGet, toNasaError, requireApiKey, enc } from './client.js';

export const nasaBrowseNeo = tool({
    description: "Browse the complete NASA near-Earth object (asteroid) dataset with pagination support. Returns comprehensive asteroid data including orbital parameters, estimated diameters, close approach events, and hazard classifications. Use this when you need to explore the entire NEO catalog or retrieve multiple asteroids across pages.",
    inputSchema: z.object({
        nasaApiKey: z.string().optional().describe("NASA API key (injected when connected; only sent to api.nasa.gov endpoints)"),
        page: z.number().int().min(0).optional().describe("Page number for pagination. Use this to navigate through the complete asteroid dataset. Page numbering starts at 0."),
        size: z.number().int().min(1).optional().describe("Number of results per page. Controls how many asteroids are returned in a single request. Default varies by API configuration."),
    }),
    execute: async ({ nasaApiKey, page, size }) => {
        const missing = requireApiKey(nasaApiKey);
        if (missing) return missing;
        try {
            const query: Record<string, unknown> = {};
            if (page !== undefined) query["page"] = page;
            if (size !== undefined) query["size"] = size;
            query['api_key'] = nasaApiKey;
return await nasaGet("https://api.nasa.gov", `/neo/rest/v1/neo/browse`, { query });
        } catch (error) {
            return toNasaError(error, "Failed to browse neo");
        }
    },
});

export const nasaGetNeoLookup = tool({
    description: "Lookup a specific asteroid by its NASA SPK-ID. Returns detailed orbital and physical data including estimated diameter, close approach history, and hazard classification. Use when you need comprehensive information about a specific known asteroid.",
    inputSchema: z.object({
        nasaApiKey: z.string().optional().describe("NASA API key (injected when connected; only sent to api.nasa.gov endpoints)"),
        asteroidId: z.string().describe("Asteroid SPK-ID for lookup. This is the unique identifier assigned by NASA to each asteroid (e.g., '3542519')."),
    }),
    execute: async ({ nasaApiKey, asteroidId }) => {
        const missing = requireApiKey(nasaApiKey);
        if (missing) return missing;
        try {
            const query: Record<string, unknown> = {};
            query['api_key'] = nasaApiKey;
return await nasaGet("https://api.nasa.gov", `/neo/rest/v1/neo/${enc(asteroidId)}`, { query });
        } catch (error) {
            return toNasaError(error, "Failed to get neo lookup");
        }
    },
});

export const nasaSearchNearEarthObjects = tool({
    description: "Search for near-Earth objects (asteroids) by their closest approach date to Earth. Returns detailed information about asteroids including: - Estimated diameter in multiple units (kilometers, meters, miles, feet) - Close approach data with velocity and miss distance - Hazard classification (potentially hazardous or not) - NASA JPL reference URLs for detailed information Use this tool when you need to find asteroids approaching Earth within a specific date range (max 7 days). Useful for tracking asteroid activity, identifying potentially hazardous objects, or researching specific time periods.",
    inputSchema: z.object({
        nasaApiKey: z.string().optional().describe("NASA API key (injected when connected; only sent to api.nasa.gov endpoints)"),
        endDate: z.string().optional().describe("End date for asteroid search in YYYY-MM-DD format (e.g., '2024-01-20'). Must be within 7 days of start_date. If not provided, defaults to 7 days after start_date."),
        startDate: z.string().describe("Start date for asteroid search in YYYY-MM-DD format (e.g., '2024-01-15'). Returns asteroids with close approach dates on or after this date."),
    }),
    execute: async ({ nasaApiKey, startDate, endDate }) => {
        const missing = requireApiKey(nasaApiKey);
        if (missing) return missing;
        try {
            const query: Record<string, unknown> = {};
            if (startDate !== undefined) query["start_date"] = startDate;
            if (endDate !== undefined) query["end_date"] = endDate;
            query['api_key'] = nasaApiKey;
return await nasaGet("https://api.nasa.gov", `/neo/rest/v1/feed`, { query });
        } catch (error) {
            return toNasaError(error, "Failed to search near earth objects");
        }
    },
});
