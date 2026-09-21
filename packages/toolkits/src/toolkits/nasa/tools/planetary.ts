// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { nasaGet, toNasaError, requireApiKey, enc } from './client.js';

export const nasaGetApod = tool({
    description: "Retrieves NASA's Astronomy Picture of the Day (APOD) for a specified date or today. Returns image/video URL, title, explanation, and metadata including copyright and high-resolution URLs when available. Use this when you need to access NASA's daily astronomy images or their descriptions. Valid for dates from June 16, 1995 to present.",
    inputSchema: z.object({
        nasaApiKey: z.string().optional().describe("NASA API key (injected when connected; only sent to api.nasa.gov endpoints)"),
        hd: z.boolean().optional().describe("Whether to retrieve the URL for the high-resolution image. If True, the response will include the 'hdurl' field (when available)."),
        date: z.string().optional().describe("The date of the APOD image to retrieve in YYYY-MM-DD format (e.g., '2024-01-15'). If not provided, defaults to today's date. Valid dates range from June 16, 1995 to the present."),
    }),
    execute: async ({ nasaApiKey, hd, date }) => {
        const missing = requireApiKey(nasaApiKey);
        if (missing) return missing;
        try {
            const query: Record<string, unknown> = {};
            if (date !== undefined) query["date"] = date;
            if (hd !== undefined) query["hd"] = hd;
            query['api_key'] = nasaApiKey;
return await nasaGet("https://api.nasa.gov", `/planetary/apod`, { query });
        } catch (error) {
            return toNasaError(error, "Failed to get apod");
        }
    },
});

export const nasaGetMarsRoverPhotos = tool({
    description: "Retrieves photos taken by NASA Mars rovers (Perseverance, Curiosity, Opportunity, Spirit) on a specific Martian sol (day). Returns photo metadata including image URLs, camera info, Earth dates, and rover details. Use this when you need to access Mars rover imagery for a particular sol number. Sol 0 represents the landing date for each rover.",
    inputSchema: z.object({
        nasaApiKey: z.string().optional().describe("NASA API key (injected when connected; only sent to api.nasa.gov endpoints)"),
        sol: z.number().int().min(0).describe("Martian sol (day) number on which photos were taken; non-negative integer."),
        page: z.number().int().min(1).optional().describe("Page number for paginated results; must be ≥1."),
        camera: z.string().optional().describe("Filter by camera abbreviation. Common cameras include: FHAZ (Front Hazard Avoidance), RHAZ (Rear Hazard Avoidance), MAST (Mast Camera), CHEMCAM (Chemistry Camera), NAVCAM (Navigation Camera). Available cameras vary by rover. Case-insensitive."),
        roverName: z.enum(["perseverance", "curiosity", "opportunity", "spirit"]).describe("Name of the Mars rover to retrieve photos from. Options: 'perseverance' (landed Feb 2021), 'curiosity' (landed Aug 2012), 'opportunity' (2004-2018), or 'spirit' (2004-2010)."),
    }),
    execute: async ({ nasaApiKey, roverName, sol, page, camera }) => {
        const missing = requireApiKey(nasaApiKey);
        if (missing) return missing;
        try {
            const query: Record<string, unknown> = {};
            if (sol !== undefined) query["sol"] = sol;
            if (camera !== undefined) query["camera"] = camera;
            if (page !== undefined) query["page"] = page;
            query['api_key'] = nasaApiKey;
return await nasaGet("https://api.nasa.gov", `/mars-photos/api/v1/rovers/${enc(roverName)}/photos`, { query });
        } catch (error) {
            return toNasaError(error, "Failed to get mars rover photos");
        }
    },
});

export const nasaGetInsightWeather = tool({
    description: "Retrieves Mars weather data from NASA's InSight lander at Elysium Planitia. Returns temperature, wind, and pressure measurements for the last seven available Sols (Martian days). Use this when you need Mars surface weather data including atmospheric conditions. Note: InSight mission ended in December 2022, so this returns historical data.",
    inputSchema: z.object({
        nasaApiKey: z.string().optional().describe("NASA API key (injected when connected; only sent to api.nasa.gov endpoints)"),
        ver: z.string().optional().describe("Version of the API to use."),
        feedtype: z.string().optional().describe("Format of the data feed. Use 'json' for JSON format."),
    }),
    execute: async ({ nasaApiKey, ver, feedtype }) => {
        const missing = requireApiKey(nasaApiKey);
        if (missing) return missing;
        try {
            const query: Record<string, unknown> = { feedtype: feedtype ?? 'json', ver: ver ?? '1.0' };
            query['api_key'] = nasaApiKey;
            return await nasaGet("https://api.nasa.gov", `/insight_weather/`, { query });
        } catch (error) {
            return toNasaError(error, "Failed to get insight weather");
        }
    },
});

export const nasaGetEpicNatural = tool({
    description: "Retrieve metadata for the most recent natural color Earth imagery from NASA's DSCOVR EPIC camera. Returns an array of image metadata including capture timestamps, geographical coordinates, spacecraft positioning data, and image identifiers. Use this when you need information about recent Earth imagery from the EPIC instrument, which captures full-disc images of Earth from the L1 Lagrange point.",
    inputSchema: z.object({
        nasaApiKey: z.string().optional().describe("NASA API key (injected when connected; only sent to api.nasa.gov endpoints)"),
    }),
    execute: async ({ nasaApiKey }) => {
        const missing = requireApiKey(nasaApiKey);
        if (missing) return missing;
        try {
            const query: Record<string, unknown> = {};
            query['api_key'] = nasaApiKey;
return await nasaGet("https://api.nasa.gov", `/EPIC/api/natural`, { query });
        } catch (error) {
            return toNasaError(error, "Failed to get epic natural");
        }
    },
});

export const nasaGetEpicNaturalDate = tool({
    description: "Retrieves metadata for natural color Earth imagery from DSCOVR EPIC for a specific date. Returns image identifiers, capture times, satellite positions, and geographical coordinates for all images captured on the specified date. Use this when you need to access Earth observation data from the EPIC camera, including satellite positioning and viewing angles.",
    inputSchema: z.object({
        nasaApiKey: z.string().optional().describe("NASA API key (injected when connected; only sent to api.nasa.gov endpoints)"),
        date: z.string().describe("Date in YYYY-MM-DD format (e.g., '2024-01-01'). Retrieves all natural color images captured on this date."),
    }),
    execute: async ({ nasaApiKey, date }) => {
        const missing = requireApiKey(nasaApiKey);
        if (missing) return missing;
        try {
            const query: Record<string, unknown> = {};
            query['api_key'] = nasaApiKey;
return await nasaGet("https://api.nasa.gov", `/EPIC/api/natural/date/${enc(date)}`, { query });
        } catch (error) {
            return toNasaError(error, "Failed to get epic natural date");
        }
    },
});

export const nasaGetEpicEnhanced = tool({
    description: "Retrieves metadata for the most recent enhanced color Earth imagery from the DSCOVR EPIC camera. Returns satellite position data, coordinates, timestamps, and image identifiers. Use this when you need to access the latest full-disk Earth images with enhanced color processing.",
    inputSchema: z.object({
        nasaApiKey: z.string().optional().describe("NASA API key (injected when connected; only sent to api.nasa.gov endpoints)"),
    }),
    execute: async ({ nasaApiKey }) => {
        const missing = requireApiKey(nasaApiKey);
        if (missing) return missing;
        try {
            const query: Record<string, unknown> = {};
            query['api_key'] = nasaApiKey;
return await nasaGet("https://api.nasa.gov", `/EPIC/api/enhanced`, { query });
        } catch (error) {
            return toNasaError(error, "Failed to get epic enhanced");
        }
    },
});

export const nasaGetEpicEnhancedDate = tool({
    description: "Retrieves metadata for enhanced color Earth imagery from DSCOVR EPIC for a specific date. Returns satellite position data, coordinates, timestamps, and image identifiers for all images captured on the given date. Use this when you need to access enhanced color Earth images for a particular historical date.",
    inputSchema: z.object({
        nasaApiKey: z.string().optional().describe("NASA API key (injected when connected; only sent to api.nasa.gov endpoints)"),
        date: z.string().describe("Date to retrieve enhanced color imagery for in YYYY-MM-DD format (e.g., '2024-01-15')."),
    }),
    execute: async ({ nasaApiKey, date }) => {
        const missing = requireApiKey(nasaApiKey);
        if (missing) return missing;
        try {
            const query: Record<string, unknown> = {};
            query['api_key'] = nasaApiKey;
return await nasaGet("https://api.nasa.gov", `/EPIC/api/enhanced/date/${enc(date)}`, { query });
        } catch (error) {
            return toNasaError(error, "Failed to get epic enhanced date");
        }
    },
});

export const nasaGetEpicAerosol = tool({
    description: "Tool to retrieve metadata for the most recent aerosol index imagery from NASA's DSCOVR EPIC camera. Returns detailed metadata including image identifiers, capture dates, spacecraft positions, and geographic coordinates. Use when you need information about Earth's aerosol measurements from the EPIC instrument.",
    inputSchema: z.object({
        nasaApiKey: z.string().optional().describe("NASA API key (injected when connected; only sent to api.nasa.gov endpoints)"),
    }),
    execute: async ({ nasaApiKey }) => {
        const missing = requireApiKey(nasaApiKey);
        if (missing) return missing;
        try {
            const query: Record<string, unknown> = {};
            query['api_key'] = nasaApiKey;
return await nasaGet("https://api.nasa.gov", `/EPIC/api/aerosol`, { query });
        } catch (error) {
            return toNasaError(error, "Failed to get epic aerosol");
        }
    },
});

export const nasaGetEpicAerosolDate = tool({
    description: "Retrieves metadata for aerosol index imagery from NASA's EPIC camera for a specific date. Returns a list of images with detailed positional data including satellite, lunar, and solar positions in J2000 coordinates, geographical centroid, and attitude quaternions. Use this when you need aerosol index data from EPIC for analysis or visualization of atmospheric aerosol distribution.",
    inputSchema: z.object({
        nasaApiKey: z.string().optional().describe("NASA API key (injected when connected; only sent to api.nasa.gov endpoints)"),
        date: z.string().describe("Date for which to retrieve aerosol imagery metadata in YYYY-MM-DD format (e.g., '2024-01-15')."),
    }),
    execute: async ({ nasaApiKey, date }) => {
        const missing = requireApiKey(nasaApiKey);
        if (missing) return missing;
        try {
            const query: Record<string, unknown> = {};
            query['api_key'] = nasaApiKey;
return await nasaGet("https://api.nasa.gov", `/EPIC/api/aerosol/date/${enc(date)}`, { query });
        } catch (error) {
            return toNasaError(error, "Failed to get epic aerosol date");
        }
    },
});

export const nasaGetEpicCloud = tool({
    description: "Retrieve metadata for the most recent cloud fraction imagery from NASA's DSCOVR EPIC camera. Returns an array of image metadata including capture timestamps, geographical coordinates, spacecraft positioning data, and image identifiers. Use this when you need information about recent cloud fraction observations from the EPIC instrument.",
    inputSchema: z.object({
        nasaApiKey: z.string().optional().describe("NASA API key (injected when connected; only sent to api.nasa.gov endpoints)"),
    }),
    execute: async ({ nasaApiKey }) => {
        const missing = requireApiKey(nasaApiKey);
        if (missing) return missing;
        try {
            const query: Record<string, unknown> = {};
            query['api_key'] = nasaApiKey;
return await nasaGet("https://api.nasa.gov", `/EPIC/api/cloud`, { query });
        } catch (error) {
            return toNasaError(error, "Failed to get epic cloud");
        }
    },
});

export const nasaGetEpicCloudDate = tool({
    description: "Get metadata for cloud fraction imagery from DSCOVR EPIC camera for a specific date. Returns satellite position, Earth coordinates, attitude data, and image identifiers for cloud fraction observations on the requested date.",
    inputSchema: z.object({
        nasaApiKey: z.string().optional().describe("NASA API key (injected when connected; only sent to api.nasa.gov endpoints)"),
        date: z.string().describe("Date for which to retrieve cloud fraction imagery metadata in YYYY-MM-DD format (e.g., '2024-01-15')."),
    }),
    execute: async ({ nasaApiKey, date }) => {
        const missing = requireApiKey(nasaApiKey);
        if (missing) return missing;
        try {
            const query: Record<string, unknown> = {};
            query['api_key'] = nasaApiKey;
return await nasaGet("https://api.nasa.gov", `/EPIC/api/cloud/date/${enc(date)}`, { query });
        } catch (error) {
            return toNasaError(error, "Failed to get epic cloud date");
        }
    },
});

export const nasaListEpicNaturalDates = tool({
    description: "Retrieve a listing of all dates with available natural color Earth imagery from DSCOVR EPIC. Returns a list of dates in YYYY-MM-DD format for which natural color imagery is available. Use this when you need to know which dates have EPIC natural color imagery available before fetching specific date images.",
    inputSchema: z.object({
        nasaApiKey: z.string().optional().describe("NASA API key (injected when connected; only sent to api.nasa.gov endpoints)"),
    }),
    execute: async ({ nasaApiKey }) => {
        const missing = requireApiKey(nasaApiKey);
        if (missing) return missing;
        try {
            const query: Record<string, unknown> = {};
            query['api_key'] = nasaApiKey;
return await nasaGet("https://api.nasa.gov", `/EPIC/api/natural/available`, { query });
        } catch (error) {
            return toNasaError(error, "Failed to list epic natural dates");
        }
    },
});

export const nasaListEpicEnhancedDates = tool({
    description: "Retrieves a listing of all dates with available enhanced color Earth imagery from NASA's DSCOVR EPIC (Earth Polychromatic Imaging Camera). Use this when you need to discover which dates have enhanced color imagery available for viewing or further retrieval. Enhanced color imagery shows Earth with vegetation highlighted in red, making it useful for environmental monitoring.",
    inputSchema: z.object({
        nasaApiKey: z.string().optional().describe("NASA API key (injected when connected; only sent to api.nasa.gov endpoints)"),
    }),
    execute: async ({ nasaApiKey }) => {
        const missing = requireApiKey(nasaApiKey);
        if (missing) return missing;
        try {
            const query: Record<string, unknown> = {};
            query['api_key'] = nasaApiKey;
return await nasaGet("https://api.nasa.gov", `/EPIC/api/enhanced/available`, { query });
        } catch (error) {
            return toNasaError(error, "Failed to list epic enhanced dates");
        }
    },
});

export const nasaListEpicAerosolDates = tool({
    description: "Tool to retrieve a list of all dates with available aerosol index EPIC imagery. Use when you need to know which dates have aerosol data available from NASA's EPIC camera.",
    inputSchema: z.object({
        nasaApiKey: z.string().optional().describe("NASA API key (injected when connected; only sent to api.nasa.gov endpoints)"),
    }),
    execute: async ({ nasaApiKey }) => {
        const missing = requireApiKey(nasaApiKey);
        if (missing) return missing;
        try {
            const query: Record<string, unknown> = {};
            query['api_key'] = nasaApiKey;
return await nasaGet("https://api.nasa.gov", `/EPIC/api/aerosol/available`, { query });
        } catch (error) {
            return toNasaError(error, "Failed to list epic aerosol dates");
        }
    },
});

export const nasaListEpicCloudDates = tool({
    description: "Retrieve a listing of all dates with available cloud fraction Earth imagery from DSCOVR EPIC. Returns a list of dates in YYYY-MM-DD format for which cloud fraction imagery is available. Use this when you need to know which dates have EPIC cloud fraction imagery available before fetching specific date images.",
    inputSchema: z.object({
        nasaApiKey: z.string().optional().describe("NASA API key (injected when connected; only sent to api.nasa.gov endpoints)"),
    }),
    execute: async ({ nasaApiKey }) => {
        const missing = requireApiKey(nasaApiKey);
        if (missing) return missing;
        try {
            const query: Record<string, unknown> = {};
            query['api_key'] = nasaApiKey;
return await nasaGet("https://api.nasa.gov", `/EPIC/api/cloud/available`, { query });
        } catch (error) {
            return toNasaError(error, "Failed to list epic cloud dates");
        }
    },
});
