// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { nasaGet, nasaDownloadMeta, toNasaError, enc } from './client.js';

export const nasaGetAgageData = tool({
    description: "Tool to retrieve information about AGAGE (Advanced Global Atmospheric Gases Experiment) data files. Returns paginated results (40 files per page) with detailed metadata including compound names, stations, dates, instruments, and file locations. Use when you need to search or browse AGAGE atmospheric data files. Supports filtering by recommendation status, compounds, stations, date ranges, and other criteria.",
    inputSchema: z.object({
        nasaApiKey: z.string().optional().describe("NASA API key (injected when connected; only sent to api.nasa.gov endpoints)"),
        page: z.number().int().min(1).optional().describe("Page number for paginated results. Each page returns 40 data files. Must be 1 or greater."),
        order: z.string().optional().describe("Primary sort order for results. Valid values: 'compound_display_order', 'station_display_order', 'data_date', 'upload_date', 'compound_name', 'file_name', 'product_type_name', 'data_frequency_name', 'instrument_names', 'station_name', 'version_name'. Secondary sort is always by station display_order. Defaults to 'compound_display_order'."),
        station: z.string().optional().describe("One or more comma-separated station IDs to filter by (e.g., '16')."),
        version: z.string().optional().describe("One or more comma-separated version IDs to filter by (e.g., '1')."),
        compound: z.string().optional().describe("One or more comma-separated compound IDs to filter by (e.g., '14' or '14,15,16')."),
        maxDate: z.string().optional().describe("Exclude all data after this date. Format: YYYY-MM-DD (e.g., '2030-05-01')."),
        minDate: z.string().optional().describe("Exclude all data before this date. Format: YYYY-MM-DD (e.g., '2021-05-01')."),
        instrument: z.string().optional().describe("One or more comma-separated instrument IDs to filter by (e.g., '6')."),
        recommended: z.boolean().optional().describe("Filter by recommendation status. If true, returns only files recommended by the AGAGE team. If false, returns non-recommended files. If omitted, returns all files regardless of recommendation status."),
        productType: z.string().optional().describe("One or more comma-separated product type IDs to filter by (e.g., '1' or '1,2')."),
        dataFrequency: z.string().optional().describe("One or more comma-separated data frequency IDs to filter by (e.g., '1')."),
        orderDirection: z.string().optional().describe("Sort direction for the order parameter. Valid values: 'asc' (ascending) or 'desc' (descending). Defaults to 'desc'."),
    }),
    execute: async ({ nasaApiKey, page, order, station, version, compound, maxDate, minDate, instrument, recommended, productType, dataFrequency, orderDirection }) => {
        try {
            const query: Record<string, unknown> = {};
            if (compound !== undefined) query["compound"] = compound;
            if (productType !== undefined) query["product_type"] = productType;
            if (dataFrequency !== undefined) query["data_frequency"] = dataFrequency;
            if (instrument !== undefined) query["instrument"] = instrument;
            if (version !== undefined) query["version"] = version;
            if (station !== undefined) query["station"] = station;
            if (minDate !== undefined) query["min_date"] = minDate;
            if (maxDate !== undefined) query["max_date"] = maxDate;
            if (recommended !== undefined) query["recommended"] = recommended;
            if (order !== undefined) query["order"] = order;
            if (orderDirection !== undefined) query["order_direction"] = orderDirection;
            return await nasaGet("https://www-air.larc.nasa.gov/missions/agage/api", `/data/${page ?? 1}`, { query });
        } catch (error) {
            return toNasaError(error, "Failed to get agage data");
        }
    },
});

export const nasaGetAgageDataByFileName = tool({
    description: "Search for AGAGE (Advanced Global Atmospheric Gases Experiment) data files by file name. Returns detailed metadata about matching files including compound information, station details, temporal coverage, geographic coordinates, and file properties. Use this when you need to find specific AGAGE data files or retrieve metadata about atmospheric gas measurements.",
    inputSchema: z.object({
        nasaApiKey: z.string().optional().describe("NASA API key (injected when connected; only sent to api.nasa.gov endpoints)"),
        fileName: z.string().describe("The name of the file to search for. Can be a full filename (e.g., 'agage_adr_ch3ccl3_git-baseline-20250123.nc') or a partial name depending on match_type."),
        matchType: z.enum(["exact_match", "begins_with", "ends_with"]).optional().describe("Match type for file name search."),
    }),
    execute: async ({ nasaApiKey, fileName, matchType }) => {
        try {
            const query: Record<string, unknown> = {};
            if (fileName !== undefined) query["file_name"] = fileName;
            if (matchType !== undefined) query["match_type"] = matchType;
return await nasaGet("https://www-air.larc.nasa.gov/missions/agage/api", `/data/search_by_file_name`, { query });
        } catch (error) {
            return toNasaError(error, "Failed to get agage data by file name");
        }
    },
});

export const nasaGetAgageDataJsonForGraph = tool({
    description: "Retrieve AGAGE atmospheric composition data in JSON format optimized for graphing. Returns time series data including O3_Number_Density and other trace gas measurements with start/stop dates. Use this when you need to visualize or analyze atmospheric composition trends from NASA's Advanced Global Atmospheric Gases Experiment (AGAGE) network.",
    inputSchema: z.object({
        nasaApiKey: z.string().optional().describe("NASA API key (injected when connected; only sent to api.nasa.gov endpoints)"),
        id: z.number().int().min(1).describe("Data ID associated with one hi-res AGAGE file. Use this to retrieve specific atmospheric composition measurements."),
    }),
    execute: async ({ nasaApiKey, id }) => {
        try {
return await nasaGet("https://www-air.larc.nasa.gov/missions/agage/api", `/data/json_for_graph/${enc(id)}`);
        } catch (error) {
            return toNasaError(error, "Failed to get agage data json for graph");
        }
    },
});

export const nasaGetAgageDataDownload = tool({
    description: "Download AGAGE (Advanced Global Atmospheric Gases Experiment) data files by ID. Accepts up to 35 comma-separated data IDs in a single request. Returns the requested data file(s) as a downloadable binary file. Use this when you need to retrieve specific AGAGE atmospheric measurement datasets.",
    inputSchema: z.object({
        nasaApiKey: z.string().optional().describe("NASA API key (injected when connected; only sent to api.nasa.gov endpoints)"),
        ids: z.string().describe("A comma-delimited list of data IDs to download (e.g., '1127' or '1127,1128,1129'). Maximum 35 IDs per request. Each ID corresponds to a specific AGAGE dataset file."),
    }),
    execute: async ({ nasaApiKey, ids }) => {
        try {
            const headers: Record<string, string> = {};
            return await nasaDownloadMeta("https://www-air.larc.nasa.gov/missions/agage/api", `/data/download/${enc(ids)}`, headers);
        } catch (error) {
            return toNasaError(error, "Failed to get agage data download");
        }
    },
});

export const nasaGetAgageDataVersions = tool({
    description: "Tool to retrieve information on all AGAGE (Advanced Global Atmospheric Gases Experiment) data versions. Use when you need version details, DOIs, citations, or descriptions for the NASA AGAGE dataset archive.",
    inputSchema: z.object({
        nasaApiKey: z.string().optional().describe("NASA API key (injected when connected; only sent to api.nasa.gov endpoints)"),
    }),
    execute: async ({ nasaApiKey }) => {
        try {
return await nasaGet("https://www-air.larc.nasa.gov/missions/agage/api", `/data/versions`);
        } catch (error) {
            return toNasaError(error, "Failed to get agage data versions");
        }
    },
});

export const nasaGetCompounds = tool({
    description: "Tool to retrieve information on all data compounds available in NASA's AGAGE (Advanced Global Atmospheric Gases Experiment) API. Use when you need to discover available chemical compounds, their identifiers, and descriptions.",
    inputSchema: z.object({
        nasaApiKey: z.string().optional().describe("NASA API key (injected when connected; only sent to api.nasa.gov endpoints)"),
    }),
    execute: async ({ nasaApiKey }) => {
        try {
return await nasaGet("https://www-air.larc.nasa.gov/missions/agage/api", `/data/compounds`);
        } catch (error) {
            return toNasaError(error, "Failed to get compounds");
        }
    },
});

export const nasaGetStations = tool({
    description: "Tool to retrieve information on all AGAGE (Advanced Global Atmospheric Gases Experiment) data stations. Use when you need station names, locations, coordinates, elevation, or other metadata about monitoring sites.",
    inputSchema: z.object({
        nasaApiKey: z.string().optional().describe("NASA API key (injected when connected; only sent to api.nasa.gov endpoints)"),
    }),
    execute: async ({ nasaApiKey }) => {
        try {
return await nasaGet("https://www-air.larc.nasa.gov/missions/agage/api", `/data/stations`);
        } catch (error) {
            return toNasaError(error, "Failed to get stations");
        }
    },
});

export const nasaGetDataFrequencies = tool({
    description: "Retrieves all available data frequency options from NASA's AGAGE (Advanced Global Atmospheric Gases Experiment) mission. Data frequencies define the measurement intervals for atmospheric data collection (e.g., hourly, daily). Use this tool to: - Discover available measurement frequencies for AGAGE data - Get frequency IDs for filtering atmospheric gas data by sampling rate - Understand what each frequency option represents No parameters required - returns all available data frequencies.",
    inputSchema: z.object({
        nasaApiKey: z.string().optional().describe("NASA API key (injected when connected; only sent to api.nasa.gov endpoints)"),
    }),
    execute: async ({ nasaApiKey }) => {
        try {
return await nasaGet("https://www-air.larc.nasa.gov/missions/agage/api", `/data/data_frequencies`);
        } catch (error) {
            return toNasaError(error, "Failed to get data frequencies");
        }
    },
});

export const nasaGetProcessingTypes = tool({
    description: "Tool to retrieve information on all data instruments from NASA's AGAGE mission. Use when you need to list available instruments with their IDs, names, and descriptions.",
    inputSchema: z.object({
        nasaApiKey: z.string().optional().describe("NASA API key (injected when connected; only sent to api.nasa.gov endpoints)"),
    }),
    execute: async ({ nasaApiKey }) => {
        try {
return await nasaGet("https://www-air.larc.nasa.gov/missions/agage/api", `/data/instruments`);
        } catch (error) {
            return toNasaError(error, "Failed to get processing types");
        }
    },
});
