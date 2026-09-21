// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { nasaGet, nasaDownloadMeta, toNasaError, enc } from './client.js';

export const nasaGetDataByFileName = tool({
    description: "Get information about specific TOLNet (Tropospheric Ozone Lidar Network) data files by file name. This tool searches the TOLNet database for lidar data files and returns detailed metadata including temporal coverage, geographic location, instrument details, and access permissions. Supports exact match, prefix match (begins_with), or suffix match (ends_with) search strategies. Use this when you need to retrieve metadata about TOLNet lidar observation files, verify file existence, check data collection periods, or obtain download locations.",
    inputSchema: z.object({
        nasaApiKey: z.string().optional().describe("NASA API key (injected when connected; only sent to api.nasa.gov endpoints)"),
        fileName: z.string().describe("The name of the file you want to search for. Can be a full file name or partial name depending on the match_type parameter."),
        matchType: z.enum(["exact_match", "begins_with", "ends_with"]).optional().describe("Match type for file name search."),
    }),
    execute: async ({ nasaApiKey, fileName, matchType }) => {
        try {
            const query: Record<string, unknown> = {};
            if (fileName !== undefined) query["file_name"] = fileName;
            if (matchType !== undefined) query["match_type"] = matchType;
return await nasaGet("https://tolnet.larc.nasa.gov/api", `/data/search_by_file_name`, { query });
        } catch (error) {
            return toNasaError(error, "Failed to get data by file name");
        }
    },
});

export const nasaGetTolnetDataJson = tool({
    description: "Tool to retrieve JSON versions of TOLNet (Tropospheric Ozone Lidar Network) data by ID. Use when you need to access hi-res TOLNet measurement data in JSON format.",
    inputSchema: z.object({
        nasaApiKey: z.string().optional().describe("NASA API key (injected when connected; only sent to api.nasa.gov endpoints)"),
        id: z.number().int().min(1).describe("Data ID associated with one hi-res TOLNet file. Must be a valid integer identifier for existing TOLNet data."),
    }),
    execute: async ({ nasaApiKey, id }) => {
        try {
return await nasaGet("https://tolnet.larc.nasa.gov/api", `/data/json/${enc(id)}`);
        } catch (error) {
            return toNasaError(error, "Failed to get tolnet data json");
        }
    },
});

export const nasaGetTolnetDataJsonForGraph = tool({
    description: "Tool to retrieve JSON versions of TOLNet data including O3_Number_Density (ozone mixing ratio) and temporal boundaries. Use when you need TOLNet lidar ozone measurements with altitude profiles, start/stop dates, and instrument metadata for a specific data ID.",
    inputSchema: z.object({
        nasaApiKey: z.string().optional().describe("NASA API key (injected when connected; only sent to api.nasa.gov endpoints)"),
        id: z.number().int().min(1).describe("One data id associated with one hi-res TOLNet file"),
    }),
    execute: async ({ nasaApiKey, id }) => {
        try {
return await nasaGet("https://tolnet.larc.nasa.gov/api", `/data/json_for_graph/${enc(id)}`);
        } catch (error) {
            return toNasaError(error, "Failed to get tolnet data json for graph");
        }
    },
});

export const nasaGetDocument = tool({
    description: "Tool to retrieve metadata for a single TOLNet (Tropospheric Ozone Lidar Network) document by ID. Use when you need information about a document such as its name, author, type, dates, and access visibility.",
    inputSchema: z.object({
        nasaApiKey: z.string().optional().describe("NASA API key (injected when connected; only sent to api.nasa.gov endpoints)"),
        id: z.number().int().min(1).describe("Document ID to retrieve. Must be a positive integer."),
    }),
    execute: async ({ nasaApiKey, id }) => {
        try {
return await nasaGet("https://tolnet.larc.nasa.gov/api", `/document/${enc(id)}`);
        } catch (error) {
            return toNasaError(error, "Failed to get document");
        }
    },
});

export const nasaGetDocumentDownload = tool({
    description: "Download a single TOLNet (Tropospheric Ozone Lidar Network) document by ID. Returns the document as a PDF file. Use when you need to retrieve a specific TOLNet document for analysis or storage.",
    inputSchema: z.object({
        nasaApiKey: z.string().optional().describe("NASA API key (injected when connected; only sent to api.nasa.gov endpoints)"),
        id: z.number().int().min(1).describe("Document ID to download. Must be a positive integer."),
    }),
    execute: async ({ nasaApiKey, id }) => {
        try {
            const headers: Record<string, string> = {};
            return await nasaDownloadMeta("https://tolnet.larc.nasa.gov/api", `/document/download/${enc(id)}`, headers);
        } catch (error) {
            return toNasaError(error, "Failed to get document download");
        }
    },
});

export const nasaGetDocuments = tool({
    description: "Tool to retrieve document information from NASA's TOLNet (Tropospheric Ozone Lidar Network) archive. Use when you need to search or browse TOLNet documents with filtering by type, keywords, or sorting options. Supports pagination for large result sets.",
    inputSchema: z.object({
        nasaApiKey: z.string().optional().describe("NASA API key (injected when connected; only sent to api.nasa.gov endpoints)"),
        q: z.string().optional().describe("Search phrase or keywords to filter documents. Searches across document fields like name, author, etc."),
        page: z.number().int().min(1).optional().describe("Starting page number (n >= 1). Use this to paginate through document results."),
        type: z.string().optional().describe("One or more comma-separated document type IDs to filter by. Example: '1,3' returns only documents of types 1 and 3."),
        order: z.enum(["display_date", "document_name", "author", "document_type_name", "public"]).optional().describe("Order options for document results."),
        orderDirection: z.enum(["asc", "desc"]).optional().describe("Sort direction options."),
    }),
    execute: async ({ nasaApiKey, q, page, type, order, orderDirection }) => {
        try {
            const query: Record<string, unknown> = {};
            if (q !== undefined) query["q"] = q;
            if (type !== undefined) query["type"] = type;
            if (order !== undefined) query["order"] = order;
            if (orderDirection !== undefined) query["order_direction"] = orderDirection;
            return await nasaGet("https://tolnet.larc.nasa.gov/api", `/documents/${page ?? 1}`, { query });
        } catch (error) {
            return toNasaError(error, "Failed to get documents");
        }
    },
});

export const nasaGetTolnetData = tool({
    description: "Tool to retrieve information about TOLNet (Tropospheric Ozone Lidar Network) data files. Use when you need to search or browse available TOLNet atmospheric data with filtering by instrument, product type, date ranges, or geographic location. Returns metadata including file details, temporal coverage, spatial location, and access information. Data is paginated with 40 items per page.",
    inputSchema: z.object({
        nasaApiKey: z.string().optional().describe("NASA API key (injected when connected; only sent to api.nasa.gov endpoints)"),
        page: z.number().int().min(1).optional().describe("Page number for paginated results. This API returns data file info 40 items at a time. Each group of 40 is one page of data. Must be 1 or greater."),
        order: z.enum(["data_date", "upload_date", "instrument_group_name", "product_type_name", "processing_type_name", "file_type_name", "file_name"]).optional().describe("Valid order fields for TOLNet data."),
        radius: z.number().min(0).max(1000).optional().describe("How many kilometers away from the provided latitude and longitude should the API search? Only used if latitude and/or longitude is provided. Default is 100 km. Must be a real number between 0 and 1000 inclusive."),
        latitude: z.number().min(-90).max(90).optional().describe("Search for data with the given latitude, within the provided radius parameter. Must be a real number between -90 and 90 inclusive. If you provide a latitude, you also need to provide a longitude."),
        maxDate: z.string().optional().describe("Exclude all data after this date. Must be in YYYY-MM-DD format (e.g., '2024-05-01')."),
        minDate: z.string().optional().describe("Exclude all data before this date. Must be in YYYY-MM-DD format (e.g., '2021-05-01')."),
        fileType: z.string().optional().describe("One or more comma-separated file_type IDs to filter by (e.g., '1')."),
        longitude: z.number().min(-180).max(180).optional().describe("Search for data with the given longitude, within the provided radius parameter. Must be a real number between -180 and 180 inclusive. If you provide a longitude, you also need to provide a latitude."),
        maxLatitude: z.number().min(-90).max(90).optional().describe("One of the 4 parameters needed to perform a lat/long bounding box search. All 4 are needed: minLatitude, minLongitude, maxLatitude, and maxLongitude. Must be a real number between -90 and 90 inclusive."),
        minLatitude: z.number().min(-90).max(90).optional().describe("One of the 4 parameters needed to perform a lat/long bounding box search. All 4 are needed: minLatitude, minLongitude, maxLatitude, and maxLongitude. Must be a real number between -90 and 90 inclusive."),
        maxLongitude: z.number().min(-180).max(180).optional().describe("One of the 4 parameters needed to perform a lat/long bounding box search. All 4 are needed: minLatitude, minLongitude, maxLatitude, and maxLongitude. Must be a real number between -180 and 180 inclusive."),
        minLongitude: z.number().min(-180).max(180).optional().describe("One of the 4 parameters needed to perform a lat/long bounding box search. All 4 are needed: minLatitude, minLongitude, maxLatitude, and maxLongitude. Must be a real number between -180 and 180 inclusive."),
        productType: z.string().optional().describe("One or more comma-separated product_type IDs to filter by (e.g., '5')."),
        nearRealTime: z.string().optional().describe("Filter by files that are near real time or not. Use 'true' to return only near real time files, 'false' to return only non-near real time files. If omitted, returns both."),
        maxUploadDate: z.string().optional().describe("Exclude all data uploaded after this date. Must be in YYYY-MM-DD format (e.g., '2024-05-01')."),
        minUploadDate: z.string().optional().describe("Exclude all data uploaded before this date. Must be in YYYY-MM-DD format (e.g., '2024-05-01')."),
        orderDirection: z.enum(["asc", "desc"]).optional().describe("Order direction for sorting results."),
        processingType: z.string().optional().describe("One or more comma-separated processing_type IDs to filter by (e.g., '2')."),
        instrumentGroup: z.string().optional().describe("One or more comma-separated instrument_group IDs to filter by (e.g., '1,2,3,4')."),
    }),
    execute: async ({ nasaApiKey, page, order, radius, latitude, maxDate, minDate, fileType, longitude, maxLatitude, minLatitude, maxLongitude, minLongitude, productType, nearRealTime, maxUploadDate, minUploadDate, orderDirection, processingType, instrumentGroup }) => {
        try {
            const query: Record<string, unknown> = {};
            if (instrumentGroup !== undefined) query["instrument_group"] = instrumentGroup;
            if (productType !== undefined) query["product_type"] = productType;
            if (processingType !== undefined) query["processing_type"] = processingType;
            if (fileType !== undefined) query["file_type"] = fileType;
            if (nearRealTime !== undefined) query["near_real_time"] = nearRealTime;
            if (minDate !== undefined) query["min_date"] = minDate;
            if (maxDate !== undefined) query["max_date"] = maxDate;
            if (minUploadDate !== undefined) query["min_upload_date"] = minUploadDate;
            if (maxUploadDate !== undefined) query["max_upload_date"] = maxUploadDate;
            if (latitude !== undefined) query["latitude"] = latitude;
            if (longitude !== undefined) query["longitude"] = longitude;
            if (radius !== undefined) query["radius"] = radius;
            if (minLatitude !== undefined) query["minLatitude"] = minLatitude;
            if (minLongitude !== undefined) query["minLongitude"] = minLongitude;
            if (maxLatitude !== undefined) query["maxLatitude"] = maxLatitude;
            if (maxLongitude !== undefined) query["maxLongitude"] = maxLongitude;
            if (order !== undefined) query["order"] = order;
            if (orderDirection !== undefined) query["order_direction"] = orderDirection;
            return await nasaGet("https://tolnet.larc.nasa.gov/api", `/data/${page ?? 1}`, { query });
        } catch (error) {
            return toNasaError(error, "Failed to get tolnet data");
        }
    },
});

export const nasaGetTolnetDataCalendar = tool({
    description: "Tool to retrieve a date-driven list of all available TOLNet (Tropospheric Ozone Lidar Network) data. Use when you need to query available TOLNet data files filtered by instrument group and file type, with optional filters for product type and processing type. Returns metadata including file names, locations, dates, geographical coordinates, and accessibility status.",
    inputSchema: z.object({
        nasaApiKey: z.string().optional().describe("NASA API key (injected when connected; only sent to api.nasa.gov endpoints)"),
        fileType: z.string().describe("One file_type id to filter TOLNet data. This identifies the specific file type to retrieve."),
        productType: z.string().optional().describe("One product_type id to filter TOLNet data (optional). Use this to narrow results to a specific product type."),
        processingType: z.string().optional().describe("One processing_type id to filter TOLNet data (optional). Use this to narrow results to a specific processing type."),
        instrumentGroup: z.string().describe("One instrument_group id to filter TOLNet data. This identifies the specific instrument group for which to retrieve available data."),
    }),
    execute: async ({ nasaApiKey, instrumentGroup, fileType, productType, processingType }) => {
        try {
            const query: Record<string, unknown> = {};
            if (instrumentGroup !== undefined) query["instrument_group"] = instrumentGroup;
            if (fileType !== undefined) query["file_type"] = fileType;
            if (productType !== undefined) query["product_type"] = productType;
            if (processingType !== undefined) query["processing_type"] = processingType;
return await nasaGet("https://tolnet.larc.nasa.gov/api", `/data/calendar`, { query });
        } catch (error) {
            return toNasaError(error, "Failed to get tolnet data calendar");
        }
    },
});

export const nasaGetFileTypes = tool({
    description: "Tool to retrieve information on all data file types from NASA's TOLNET API. Use when you need to discover available file type identifiers, names, and descriptions.",
    inputSchema: z.object({
        nasaApiKey: z.string().optional().describe("NASA API key (injected when connected; only sent to api.nasa.gov endpoints)"),
    }),
    execute: async ({ nasaApiKey }) => {
        try {
return await nasaGet("https://tolnet.larc.nasa.gov/api", `/data/file_types`);
        } catch (error) {
            return toNasaError(error, "Failed to get file types");
        }
    },
});

export const nasaGetInstrumentGroups = tool({
    description: "Tool to retrieve information on all instrument groups from NASA's TOLNET API. Use when you need to get instrument group details including IDs, names, descriptions, and Principal Investigators.",
    inputSchema: z.object({
        nasaApiKey: z.string().optional().describe("NASA API key (injected when connected; only sent to api.nasa.gov endpoints)"),
    }),
    execute: async ({ nasaApiKey }) => {
        try {
return await nasaGet("https://tolnet.larc.nasa.gov/api", `/instruments/groups`);
        } catch (error) {
            return toNasaError(error, "Failed to get instrument groups");
        }
    },
});

export const nasaGetProductTypes = tool({
    description: "Tool to retrieve all data product types from NASA's TOLNET (TOLNet Ozone Lidar Network) API. Use when you need to discover available product types or get product type metadata including names, descriptions, and display ordering.",
    inputSchema: z.object({
        nasaApiKey: z.string().optional().describe("NASA API key (injected when connected; only sent to api.nasa.gov endpoints)"),
    }),
    execute: async ({ nasaApiKey }) => {
        try {
return await nasaGet("https://tolnet.larc.nasa.gov/api", `/data/product_types`);
        } catch (error) {
            return toNasaError(error, "Failed to get product types");
        }
    },
});
