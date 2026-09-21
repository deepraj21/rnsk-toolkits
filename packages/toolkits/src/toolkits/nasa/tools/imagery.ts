// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { nasaGet, toNasaError, requireApiKey, enc, tapSync } from './client.js';

export const nasaGetTechportProject = tool({
    description: "Retrieves detailed information about a specific NASA technology project from TechPort. Returns comprehensive project data including title, description, benefits, status, program details, contacts, organizations, and technology readiness levels. Use this when you need information about a specific NASA technology project by its TechPort ID.",
    inputSchema: z.object({
        nasaApiKey: z.string().optional().describe("NASA API key (injected when connected; only sent to api.nasa.gov endpoints)"),
        id: z.number().int().describe("TechPort project ID. This is the unique identifier for the NASA technology project."),
    }),
    execute: async ({ nasaApiKey, id }) => {
        const missing = requireApiKey(nasaApiKey);
        if (missing) return missing;
        try {
            const query: Record<string, unknown> = {};
            query['api_key'] = nasaApiKey;
return await nasaGet("https://api.nasa.gov", `/techport/api/projects/${enc(id)}`, { query });
        } catch (error) {
            return toNasaError(error, "Failed to get techport project");
        }
    },
});

export const nasaQueryExoplanetArchive = tool({
    description: "Tool to query NASA's Exoplanet Archive NSTED API for exoplanet and related astronomical data. Use when you need to search, filter, or retrieve data about confirmed exoplanets, Kepler Objects of Interest (KOIs), planetary systems, or composite planet parameters. Supports SQL-like filtering, column selection, sorting, and multiple output formats (JSON, CSV, ASCII, IPAC).",
    inputSchema: z.object({
        nasaApiKey: z.string().optional().describe("NASA API key (injected when connected; only sent to api.nasa.gov endpoints)"),
        order: z.string().optional().describe("Column name to sort results by, optionally followed by 'desc' for descending order (e.g., 'koi_period', 'koi_period desc'). Defaults to ascending order if 'desc' is not specified."),
        table: z.string().describe("Specifies which data table to query. Common tables: 'cumulative' (Kepler cumulative table), 'exoplanets' (confirmed exoplanets), 'ps' (planetary systems), 'koi' (Kepler Objects of Interest), 'compositepars' (composite planet parameters)."),
        where: z.string().optional().describe("SQL-like filter conditions to narrow results (e.g., 'koi_period>300 and koi_prad<2', 'pl_masse>1.0'). Supports comparison operators (<, >, <=, >=, =, !=) and logical operators (and, or)."),
        format: z.enum(["csv", "json", "ascii", "ipac"]).optional().describe("Output format for exoplanet data."),
        select: z.string().optional().describe("Comma-separated list of column names to return (e.g., 'pl_hostname,ra,dec,pl_orbper'). Use '*' to return all columns. If omitted, returns all columns by default."),
    }),
    execute: async ({ nasaApiKey, table, order, where, format, select }) => {
        try {
            return await tapSync({ table, where, select, order, format: format ?? 'json' });
        } catch (error) {
            return toNasaError(error, "Failed to query exoplanet archive");
        }
    },
});

export const nasaSearchTechtransferSoftware = tool({
    description: "Search NASA's Technology Transfer software catalog for available tools and applications. Returns software entries with titles, descriptions, NASA case numbers, and licensing information. Use this when searching for NASA software tools available for public use, licensing, or download.",
    inputSchema: z.object({
        nasaApiKey: z.string().optional().describe("NASA API key (injected when connected; only sent to api.nasa.gov endpoints)"),
        keywords: z.string().optional().describe("Search keywords to filter the software catalog. If not provided, returns all available software entries. Examples: 'visualization', 'machine learning', 'data processing'."),
    }),
    execute: async ({ nasaApiKey, keywords }) => {
        const missing = requireApiKey(nasaApiKey);
        if (missing) return missing;
        try {
            const query: Record<string, unknown> = {};
            if (keywords !== undefined) query["keywords"] = keywords;
            query['api_key'] = nasaApiKey;
return await nasaGet("https://api.nasa.gov", `/techtransfer/software/`, { query });
        } catch (error) {
            return toNasaError(error, "Failed to search techtransfer software");
        }
    },
});

export const nasaGetImageAsset = tool({
    description: "Retrieve a media asset's manifest from the NASA Image and Video Library, including links to all available sizes and formats. Returns URLs for different image sizes (original, large, medium, small, thumbnail) and metadata. Use when you need to access specific media files after finding them through search.",
    inputSchema: z.object({
        nasaApiKey: z.string().optional().describe("NASA API key (injected when connected; only sent to api.nasa.gov endpoints)"),
        nasaId: z.string().describe("NASA ID of the media item to retrieve the asset manifest for (e.g., 'as11-40-5874'). This ID can be obtained from search results."),
    }),
    execute: async ({ nasaApiKey, nasaId }) => {
        try {
return await nasaGet("https://images-api.nasa.gov", `/asset/${enc(nasaId)}`);
        } catch (error) {
            return toNasaError(error, "Failed to get image asset");
        }
    },
});

export const nasaGetImageMetadata = tool({
    description: "Retrieve the location URL of a media asset's metadata manifest from the NASA Image and Video Library. Returns the URL to the metadata JSON file containing detailed information including EXIF/camera data. Use when you need to access comprehensive metadata for NASA images or videos.",
    inputSchema: z.object({
        nasaApiKey: z.string().optional().describe("NASA API key (injected when connected; only sent to api.nasa.gov endpoints)"),
        nasaId: z.string().describe("NASA ID of the media item to retrieve the metadata location for (e.g., 'as11-40-5874'). This ID can be obtained from search results."),
    }),
    execute: async ({ nasaApiKey, nasaId }) => {
        try {
return await nasaGet("https://images-api.nasa.gov", `/metadata/${enc(nasaId)}`);
        } catch (error) {
            return toNasaError(error, "Failed to get image metadata");
        }
    },
});

export const nasaGetVideoCaptions = tool({
    description: "Retrieves the location URL of caption files for NASA video assets from the NASA Image and Video Library. Returns the URL to the captions file (typically in SRT format) for the specified video NASA ID. Use this when you need to access subtitles or captions for NASA video content.",
    inputSchema: z.object({
        nasaApiKey: z.string().optional().describe("NASA API key (injected when connected; only sent to api.nasa.gov endpoints)"),
        nasaId: z.string().describe("NASA ID of the video for which to retrieve captions. This is typically the video title or identifier (e.g., 'Apollo 14 Launch Coverage')."),
    }),
    execute: async ({ nasaApiKey, nasaId }) => {
        try {
return await nasaGet("https://images-api.nasa.gov", `/captions/${enc(nasaId)}`);
        } catch (error) {
            return toNasaError(error, "Failed to get video captions");
        }
    },
});

export const nasaSearchSvsVisualizations = tool({
    description: "Tool to search for visualizations in the Scientific Visualization Studio (SVS). Use when you need to query SVS visualizations by keywords or mission filters.",
    inputSchema: z.object({
        nasaApiKey: z.string().optional().describe("NASA API key (injected when connected; only sent to api.nasa.gov endpoints)"),
        limit: z.any().optional().describe("Maximum number of results to return. Use an integer up to 2000, or 'all'/'none' to fetch all available results."),
        offset: z.number().int().min(0).optional().describe("Number of initial results to skip (for pagination)."),
        search: z.string().optional().describe("Free-text term to search titles and descriptions (e.g. 'Apollo')."),
        missions: z.array(z.string()).optional().describe("List of mission names to filter results. Multiple values will be joined with commas (e.g., ['JWST', 'Hubble'])."),
    }),
    execute: async ({ nasaApiKey, limit, offset, search, missions }) => {
        try {
            const query: Record<string, unknown> = {};
            if (search !== undefined) query["search"] = search;
            if (missions !== undefined) query["missions"] = missions;
            if (limit !== undefined) query["limit"] = limit;
            if (offset !== undefined) query["offset"] = offset;
return await nasaGet("https://svs.gsfc.nasa.gov", `/api/search/`, { query });
        } catch (error) {
            return toNasaError(error, "Failed to search svs visualizations");
        }
    },
});
