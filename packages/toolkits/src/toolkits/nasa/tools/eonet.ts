// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { nasaGet, toNasaError, enc, convertEonet } from './client.js';

export const nasaGetEonetCategories = tool({
    description: "Tool to retrieve a list of all event categories from EONET. Use when you need current category IDs, titles, descriptions, and info links. Note: category IDs are EONET-specific and do not map to CMR (Common Metadata Repository) IDs; use them only for EONET-internal filtering, not cross-system lookups.",
    inputSchema: z.object({
        nasaApiKey: z.string().optional().describe("NASA API key (injected when connected; only sent to api.nasa.gov endpoints)"),
    }),
    execute: async ({ nasaApiKey }) => {
        try {
return await nasaGet("https://eonet.gsfc.nasa.gov/api/v3", `/categories`);
        } catch (error) {
            return toNasaError(error, "Failed to get eonet categories");
        }
    },
});

export const nasaGetEonetCategoryEvents = tool({
    description: "Tool to retrieve natural events filtered by a specific category from NASA's EONET. Use when you need events for a specific category like wildfires, volcanoes, or severe storms.",
    inputSchema: z.object({
        nasaApiKey: z.string().optional().describe("NASA API key (injected when connected; only sent to api.nasa.gov endpoints)"),
        end: z.string().optional().describe("Ending date for event filtering in YYYY-MM-DD format. Use with 'start' parameter to define a date range."),
        days: z.number().int().positive().optional().describe("Limit events to those occurring within the last N days (including today)."),
        limit: z.number().int().positive().optional().describe("Limit the number of events returned. Must be a positive integer."),
        start: z.string().optional().describe("Starting date for event filtering in YYYY-MM-DD format. Use with 'end' parameter to define a date range."),
        source: z.string().optional().describe("Filter events by source ID (e.g., 'IRWIN', 'JTWC'). Multiple sources can be comma-separated for boolean OR filtering."),
        status: z.enum(["open", "closed"]).optional().describe("Event status filter options for EONET events."),
        categoryId: z.string().describe("Filter events by category ID (e.g., 'wildfires', 'volcanoes', 'severeStorms'). This is required to retrieve events for a specific category."),
    }),
    execute: async ({ nasaApiKey, categoryId, end, days, limit, start, source, status }) => {
        try {
            const query: Record<string, unknown> = {};
            if (status !== undefined) query["status"] = status;
            if (limit !== undefined) query["limit"] = limit;
            if (days !== undefined) query["days"] = days;
            if (start !== undefined) query["start"] = start;
            if (end !== undefined) query["end"] = end;
            if (source !== undefined) query["source"] = source;
return await nasaGet("https://eonet.gsfc.nasa.gov/api/v3", `/categories/${enc(categoryId)}`, { query });
        } catch (error) {
            return toNasaError(error, "Failed to get eonet category events");
        }
    },
});

export const nasaGetEonetEvent = tool({
    description: "Tool to retrieve a specific natural event by its unique ID from NASA's Earth Observatory Natural Event Tracker (EONET). Use when you need detailed information about a particular wildfire, storm, flood, volcano, earthquake, or other natural phenomenon.",
    inputSchema: z.object({
        nasaApiKey: z.string().optional().describe("NASA API key (injected when connected; only sent to api.nasa.gov endpoints)"),
        eventId: z.string().describe("Unique identifier of the EONET event (e.g., 'EONET_17841')"),
    }),
    execute: async ({ nasaApiKey, eventId }) => {
        try {
return await nasaGet("https://eonet.gsfc.nasa.gov/api/v3", `/events/${enc(eventId)}`);
        } catch (error) {
            return toNasaError(error, "Failed to get eonet event");
        }
    },
});

export const nasaGetEonetEvents = tool({
    description: "Tool to retrieve natural events from NASA's Earth Observatory Natural Event Tracker (EONET). Use when you need structured JSON data about wildfires, storms, floods, volcanoes, earthquakes, and other natural phenomena. Supports filtering by source, category, status, date range, magnitude, and geographic bounding box.",
    inputSchema: z.object({
        nasaApiKey: z.string().optional().describe("NASA API key (injected when connected; only sent to api.nasa.gov endpoints)"),
        end: z.string().optional().describe("Ending date for events in YYYY-MM-DD format. Only events on or before this date will be returned."),
        bbox: z.string().optional().describe("Bounding box filter in format 'lon1,lat1,lon2,lat2' where (lon1,lat1) is upper-left corner and (lon2,lat2) is lower-right corner. Returns events with datapoints within this box."),
        days: z.number().int().positive().optional().describe("Filter events from the last N days (including today). For example, days=7 returns events from the past week."),
        limit: z.number().int().positive().optional().describe("Limits the number of events returned. Must be a positive integer."),
        magID: z.enum(["mag_kts", "mms", "sq_NM"]).optional().describe("Magnitude identifier types for filtering events."),
        start: z.string().optional().describe("Starting date for events in YYYY-MM-DD format. Only events on or after this date will be returned."),
        magMax: z.number().optional().describe("Maximum magnitude value for filtering events. Requires magID to be specified."),
        magMin: z.number().optional().describe("Minimum magnitude value for filtering events. Requires magID to be specified."),
        source: z.string().optional().describe("Filter events by source ID. Multiple sources can be comma-separated (e.g., 'IRWIN,JTWC'). Operates as boolean OR."),
        status: z.enum(["open", "closed", "all"]).optional().describe("Status filter for EONET events."),
        category: z.string().optional().describe("Filter events by category ID. Multiple categories can be comma-separated (e.g., 'wildfires,floods'). Operates as boolean OR."),
    }),
    execute: async ({ nasaApiKey, end, bbox, days, limit, magID, start, magMax, magMin, source, status, category }) => {
        try {
            const query: Record<string, unknown> = {};
            if (start !== undefined) query["start"] = start;
            if (end !== undefined) query["end"] = end;
            if (bbox !== undefined) query["bbox"] = bbox;
            if (days !== undefined) query["days"] = days;
            if (limit !== undefined) query["limit"] = limit;
            if (magID !== undefined) query["magID"] = magID;
            if (magMin !== undefined) query["magMin"] = magMin;
            if (magMax !== undefined) query["magMax"] = magMax;
            if (source !== undefined) query["source"] = source;
            if (status !== undefined) query["status"] = status;
            if (category !== undefined) query["category"] = category;
return await nasaGet("https://eonet.gsfc.nasa.gov/api/v3", `/events`, { query });
        } catch (error) {
            return toNasaError(error, "Failed to get eonet events");
        }
    },
});

export const nasaGetEonetEventsAtom = tool({
    description: "Tool to retrieve a list of natural events in ATOM format. Use when you need a machine-readable XML feed of recent natural events from EONET.",
    inputSchema: z.object({
        nasaApiKey: z.string().optional().describe("NASA API key (injected when connected; only sent to api.nasa.gov endpoints)"),
        end: z.string().optional().describe("End date (inclusive) for events, in YYYY-MM-DD format."),
        bbox: z.string().optional().describe("Bounding box in 'minLon,minLat,maxLon,maxLat' format to restrict events geographically."),
        days: z.number().int().min(0).optional().describe("Return events from the past N days (including today). Must be ≥ 0."),
        limit: z.number().int().min(1).optional().describe("Maximum number of events to return. Must be ≥ 1."),
        start: z.string().optional().describe("Start date (inclusive) for events, in YYYY-MM-DD format."),
        magMax: z.number().optional().describe("Maximum magnitude value (inclusive)."),
        magMin: z.number().optional().describe("Minimum magnitude value (inclusive)."),
        magId: z.string().optional().describe("Magnitude ID to filter by (see /magnitudes endpoint)."),
        source: z.string().optional().describe("Comma-separated list of Source IDs to filter events by. Operates as a boolean OR when multiple provided."),
        status: z.enum(["open", "closed", "all"]).optional().describe("Filter by event status. 'open' (default) returns only active events; 'closed' returns only ended events; 'all' returns both."),
        category: z.string().optional().describe("Comma-separated list of Category IDs to filter events by. Operates as a boolean OR when multiple provided."),
    }),
    execute: async ({ nasaApiKey, end, bbox, days, limit, start, magMax, magMin, magId, source, status, category }) => {
        try {
            const query: Record<string, unknown> = {};
            if (end !== undefined) query["end"] = end;
            if (bbox !== undefined) query["bbox"] = bbox;
            if (days !== undefined) query["days"] = days;
            if (limit !== undefined) query["limit"] = limit;
            if (start !== undefined) query["start"] = start;
            if (magMax !== undefined) query["magMax"] = magMax;
            if (magMin !== undefined) query["magMin"] = magMin;
            if (magId !== undefined) query["mag_id"] = magId;
            if (source !== undefined) query["source"] = source;
            if (status !== undefined) query["status"] = status;
            if (category !== undefined) query["category"] = category;
            const data = await nasaGet("https://eonet.gsfc.nasa.gov/api/v3", `/events`, { query });
            return convertEonet(data, "atom");
        } catch (error) {
            return toNasaError(error, "Failed to get eonet events atom");
        }
    },
});

export const nasaGetEonetEventsGeojson = tool({
    description: "Tool to retrieve natural events from NASA's Earth Observatory Natural Event Tracker (EONET) in GeoJSON format. Use when you need geographic event data in GeoJSON format for mapping applications or GIS integration. Supports filtering by source, category, status, date range, and geographic bounding box.",
    inputSchema: z.object({
        nasaApiKey: z.string().optional().describe("NASA API key (injected when connected; only sent to api.nasa.gov endpoints)"),
        end: z.string().optional().describe("Ending date for events in YYYY-MM-DD format. Only events on or before this date will be returned."),
        bbox: z.string().optional().describe("Bounding box filter in format 'lon1,lat1,lon2,lat2' where (lon1,lat1) is upper-left corner and (lon2,lat2) is lower-right corner. Returns events with datapoints within this box."),
        days: z.number().int().positive().optional().describe("Filter events from the last N days (including today). For example, days=7 returns events from the past week."),
        limit: z.number().int().positive().optional().describe("Limits the number of events returned. Must be a positive integer."),
        start: z.string().optional().describe("Starting date for events in YYYY-MM-DD format. Only events on or after this date will be returned."),
        source: z.string().optional().describe("Filter events by source ID. Multiple sources can be comma-separated (e.g., 'IRWIN,JTWC'). Operates as boolean OR."),
        status: z.enum(["open", "closed", "all"]).optional().describe("Status filter for EONET events."),
        category: z.string().optional().describe("Filter events by category ID. Multiple categories can be comma-separated (e.g., 'wildfires,floods'). Operates as boolean OR."),
    }),
    execute: async ({ nasaApiKey, end, bbox, days, limit, start, source, status, category }) => {
        try {
            const query: Record<string, unknown> = {};
            if (end !== undefined) query["end"] = end;
            if (bbox !== undefined) query["bbox"] = bbox;
            if (days !== undefined) query["days"] = days;
            if (limit !== undefined) query["limit"] = limit;
            if (start !== undefined) query["start"] = start;
            if (source !== undefined) query["source"] = source;
            if (status !== undefined) query["status"] = status;
            if (category !== undefined) query["category"] = category;
            const data = await nasaGet("https://eonet.gsfc.nasa.gov/api/v3", `/events`, { query });
            return convertEonet(data, "geojson");
        } catch (error) {
            return toNasaError(error, "Failed to get eonet events geojson");
        }
    },
});

export const nasaGetEonetEventsRss = tool({
    description: "Retrieve natural events from NASA's Earth Observatory Natural Event Tracker (EONET) in RSS/GeoRSS XML format. This tool provides a standardized RSS 2.0 feed with GeoRSS extensions, ideal for RSS readers, mapping applications, or systems that need spatial event data in XML format. The feed includes wildfires, storms, floods, volcanoes, icebergs, and other natural phenomena with geographical coordinates, magnitudes, and source references. Use this when you need RSS/XML format specifically. For programmatic access with structured data, consider using the JSON events endpoint instead.",
    inputSchema: z.object({
        nasaApiKey: z.string().optional().describe("NASA API key (injected when connected; only sent to api.nasa.gov endpoints)"),
        days: z.number().int().positive().optional().describe("Filter events that occurred within the last N days. For example, days=10 returns events from the past 10 days only."),
        limit: z.number().int().positive().optional().describe("Limit the number of events returned in the RSS feed. Must be a positive integer. Useful for getting just the most recent events."),
        source: z.string().optional().describe("Filter events by source ID (e.g., 'IRWIN', 'JTWC', 'BYU_ICE'). Only events from the specified source will be included in the RSS feed."),
        status: z.string().optional().describe("Filter events by status: 'open' for ongoing events or 'closed' for completed events. Defaults to all statuses if not specified."),
    }),
    execute: async ({ nasaApiKey, days, limit, source, status }) => {
        try {
            const query: Record<string, unknown> = {};
            if (days !== undefined) query["days"] = days;
            if (limit !== undefined) query["limit"] = limit;
            if (source !== undefined) query["source"] = source;
            if (status !== undefined) query["status"] = status;
            const data = await nasaGet("https://eonet.gsfc.nasa.gov/api/v3", `/events`, { query });
            return convertEonet(data, "rss");
        } catch (error) {
            return toNasaError(error, "Failed to get eonet events rss");
        }
    },
});

export const nasaGetEonetLayers = tool({
    description: "Retrieves NASA EONET imagery layers for visualizing natural events. Returns web map service (WMS/WMTS) layer definitions that can be used to display satellite imagery related to events like wildfires, volcanoes, severe storms, etc. Each layer includes service URLs and parameters needed to fetch imagery tiles. Use the optional category parameter to get layers specific to an event type (recommended to avoid empty results).",
    inputSchema: z.object({
        nasaApiKey: z.string().optional().describe("NASA API key (injected when connected; only sent to api.nasa.gov endpoints)"),
        category: z.string().optional().describe("Category ID to filter layers by specific event type. Valid values include: 'wildfires', 'volcanoes', 'severeStorms', 'floods', 'landslides', 'earthquakes', 'drought', 'dustHaze', 'snow', 'seaLakeIce', 'tempExtremes', 'waterColor', 'manmade'. If omitted, returns all layers (note: may return empty list)."),
    }),
    execute: async ({ nasaApiKey, category }) => {
        try {
            const query: Record<string, unknown> = {};
            if (category !== undefined) query["category"] = category;
return await nasaGet("https://eonet.gsfc.nasa.gov/api/v3", `/layers`, { query });
        } catch (error) {
            return toNasaError(error, "Failed to get eonet layers");
        }
    },
});

export const nasaGetEonetMagnitudes = tool({
    description: "Tool to retrieve a list of available event magnitudes and their descriptions. Use after determining you need valid magnitude filters before querying events data.",
    inputSchema: z.object({
        nasaApiKey: z.string().optional().describe("NASA API key (injected when connected; only sent to api.nasa.gov endpoints)"),
    }),
    execute: async ({ nasaApiKey }) => {
        try {
return await nasaGet("https://eonet.gsfc.nasa.gov/api/v3", `/magnitudes`);
        } catch (error) {
            return toNasaError(error, "Failed to get eonet magnitudes");
        }
    },
});

export const nasaGetEonetSources = tool({
    description: "Retrieves the complete list of event data sources available in NASA's EONET (Earth Observatory Natural Event Tracker) system. Each source provides natural event data such as wildfires, volcanoes, hurricanes, floods, and earthquakes. Use this tool to: - Discover which organizations provide event data to EONET - Get source IDs for filtering events by specific data providers - Access homepage URLs and filtered event endpoints for each source No parameters required - returns all available sources.",
    inputSchema: z.object({
        nasaApiKey: z.string().optional().describe("NASA API key (injected when connected; only sent to api.nasa.gov endpoints)"),
    }),
    execute: async ({ nasaApiKey }) => {
        try {
return await nasaGet("https://eonet.gsfc.nasa.gov/api/v3", `/sources`);
        } catch (error) {
            return toNasaError(error, "Failed to get eonet sources");
        }
    },
});
