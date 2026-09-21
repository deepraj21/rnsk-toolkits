// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { nasaGet, toNasaError, requireApiKey } from './client.js';

export const nasaGetDonkiCme = tool({
    description: "Tool to retrieve Coronal Mass Ejection (CME) data from NASA's DONKI database. Use when you need detailed information about solar CME events including their speed, direction, source location, instrument detections, and impact predictions. Returns comprehensive CME analysis with ENLIL model simulations for space weather forecasting.",
    inputSchema: z.object({
        nasaApiKey: z.string().optional().describe("NASA API key (injected when connected; only sent to api.nasa.gov endpoints)"),
        endDate: z.string().optional().describe("End date for CME search in YYYY-MM-DD format (e.g., '2026-02-15'). If not provided, defaults to current date."),
        startDate: z.string().optional().describe("Start date for CME search in YYYY-MM-DD format (e.g., '2026-02-08'). If not provided, defaults to 30 days prior to current date."),
    }),
    execute: async ({ nasaApiKey, endDate, startDate }) => {
        const missing = requireApiKey(nasaApiKey);
        if (missing) return missing;
        try {
            const query: Record<string, unknown> = {};
            if (startDate !== undefined) query["startDate"] = startDate;
            if (endDate !== undefined) query["endDate"] = endDate;
            query['api_key'] = nasaApiKey;
return await nasaGet("https://api.nasa.gov", `/DONKI/CME`, { query });
        } catch (error) {
            return toNasaError(error, "Failed to get donki cme");
        }
    },
});

export const nasaGetDonkiCmeAnalysis = tool({
    description: "Tool to retrieve Coronal Mass Ejection (CME) analysis data from NASA's DONKI (Database Of Notifications, Knowledge, Information) system. Use when you need detailed CME analysis including speed, trajectory, half-angle measurements, and catalog information. Supports filtering by date range, speed threshold, half-angle, accuracy level, and catalog source.",
    inputSchema: z.object({
        nasaApiKey: z.string().optional().describe("NASA API key (injected when connected; only sent to api.nasa.gov endpoints)"),
        speed: z.number().int().min(0).optional().describe("Minimum speed filter in kilometers per second (km/s). Only returns CME analyses with speed greater than or equal to this value."),
        catalog: z.enum(["ALL", "SWRC_CATALOG", "JANG_ET_AL_CATALOG"]).optional().describe("Catalog filter types for CME analysis."),
        endDate: z.string().optional().describe("End date for CME analysis data in YYYY-MM-DD format. Filters results to analyses with time21_5 on or before this date. Defaults to current date if not provided."),
        halfAngle: z.number().int().min(0).max(180).optional().describe("Minimum half-angle filter in degrees. Only returns CME analyses with halfAngle greater than or equal to this value. Half-angle represents the angular width of the CME."),
        startDate: z.string().optional().describe("Start date for CME analysis data in YYYY-MM-DD format. Filters results to analyses with time21_5 on or after this date. Defaults to 30 days prior to current date if not provided."),
        mostAccurateOnly: z.boolean().optional().describe("If true, returns only the most accurate analysis for each CME event (where isMostAccurate=true). If false or not provided, returns all analyses."),
    }),
    execute: async ({ nasaApiKey, speed, catalog, endDate, halfAngle, startDate, mostAccurateOnly }) => {
        const missing = requireApiKey(nasaApiKey);
        if (missing) return missing;
        try {
            const query: Record<string, unknown> = {};
            if (startDate !== undefined) query["startDate"] = startDate;
            if (endDate !== undefined) query["endDate"] = endDate;
            if (mostAccurateOnly !== undefined) query["mostAccurateOnly"] = mostAccurateOnly;
            if (speed !== undefined) query["speed"] = speed;
            if (halfAngle !== undefined) query["halfAngle"] = halfAngle;
            if (catalog !== undefined) query["catalog"] = catalog;
            query['api_key'] = nasaApiKey;
return await nasaGet("https://api.nasa.gov", `/DONKI/CMEAnalysis`, { query });
        } catch (error) {
            return toNasaError(error, "Failed to get donki cme analysis");
        }
    },
});

export const nasaGetDonkiGst = tool({
    description: "Tool to retrieve Geomagnetic Storm (GST) data from NASA's Space Weather Database Of Notifications, Knowledge, Information (DONKI). Returns detailed storm events including Kp index time-series data, start times, and linked space weather events. Use when you need historical or recent geomagnetic storm information for space weather analysis or forecasting.",
    inputSchema: z.object({
        nasaApiKey: z.string().optional().describe("NASA API key (injected when connected; only sent to api.nasa.gov endpoints)"),
        endDate: z.string().optional().describe("End date for GST data in YYYY-MM-DD format (e.g., '2024-01-20'). If not provided, defaults to current date."),
        startDate: z.string().optional().describe("Start date for GST data in YYYY-MM-DD format (e.g., '2024-01-15'). If not provided, defaults to 30 days prior to current date."),
    }),
    execute: async ({ nasaApiKey, endDate, startDate }) => {
        const missing = requireApiKey(nasaApiKey);
        if (missing) return missing;
        try {
            const query: Record<string, unknown> = {};
            if (startDate !== undefined) query["startDate"] = startDate;
            if (endDate !== undefined) query["endDate"] = endDate;
            query['api_key'] = nasaApiKey;
return await nasaGet("https://api.nasa.gov", `/DONKI/GST`, { query });
        } catch (error) {
            return toNasaError(error, "Failed to get donki gst");
        }
    },
});

export const nasaGetDonkiHss = tool({
    description: "Tool to retrieve High Speed Stream (HSS) data from NASA's DONKI space weather database. Use when you need information about solar wind high-speed streams that can cause geomagnetic activity. Returns HSS events with detection times, instruments, and linked space weather events.",
    inputSchema: z.object({
        nasaApiKey: z.string().optional().describe("NASA API key (injected when connected; only sent to api.nasa.gov endpoints)"),
        endDate: z.string().optional().describe("End date for HSS search in YYYY-MM-DD format (e.g., '2024-12-31'). If not provided, defaults to current date."),
        startDate: z.string().optional().describe("Start date for HSS search in YYYY-MM-DD format (e.g., '2024-01-01'). If not provided, defaults to 30 days prior to current date."),
    }),
    execute: async ({ nasaApiKey, endDate, startDate }) => {
        const missing = requireApiKey(nasaApiKey);
        if (missing) return missing;
        try {
            const query: Record<string, unknown> = {};
            if (startDate !== undefined) query["startDate"] = startDate;
            if (endDate !== undefined) query["endDate"] = endDate;
            query['api_key'] = nasaApiKey;
return await nasaGet("https://api.nasa.gov", `/DONKI/HSS`, { query });
        } catch (error) {
            return toNasaError(error, "Failed to get donki hss");
        }
    },
});

export const nasaGetDonkiIps = tool({
    description: "Tool to retrieve Interplanetary Shock (IPS) data from NASA's DONKI space weather database. Use when you need information about shock waves traveling through interplanetary space, typically caused by CMEs or high-speed solar wind streams. Returns detailed IPS event data including location, timing, instruments, and linked space weather events.",
    inputSchema: z.object({
        nasaApiKey: z.string().optional().describe("NASA API key (injected when connected; only sent to api.nasa.gov endpoints)"),
        catalog: z.string().optional().describe("Catalog filter for IPS events. Options: 'M2M_CATALOG' (Moon-to-Mars), 'WINSLOW_MESSENGER_ICME_CATALOG'. If not provided, defaults to 'ALL' (all catalogs)."),
        endDate: z.string().optional().describe("End date for IPS search in YYYY-MM-DD format (e.g., '2026-02-15'). If not provided, defaults to current date."),
        location: z.string().optional().describe("Location filter for IPS events. Options: 'Earth', 'Mars', 'MESSENGER', 'STEREO A', 'STEREO B'. If not provided, defaults to 'ALL' (all locations)."),
        startDate: z.string().optional().describe("Start date for IPS search in YYYY-MM-DD format (e.g., '2026-02-08'). If not provided, defaults to 30 days prior to current date."),
    }),
    execute: async ({ nasaApiKey, catalog, endDate, location, startDate }) => {
        const missing = requireApiKey(nasaApiKey);
        if (missing) return missing;
        try {
            const query: Record<string, unknown> = {};
            if (startDate !== undefined) query["startDate"] = startDate;
            if (endDate !== undefined) query["endDate"] = endDate;
            if (location !== undefined) query["location"] = location;
            if (catalog !== undefined) query["catalog"] = catalog;
            query['api_key'] = nasaApiKey;
return await nasaGet("https://api.nasa.gov", `/DONKI/IPS`, { query });
        } catch (error) {
            return toNasaError(error, "Failed to get donki ips");
        }
    },
});

export const nasaGetDonkiMpc = tool({
    description: "Tool to retrieve Magnetopause Crossing (MPC) events from NASA's DONKI space weather database. Use when you need data about spacecraft crossings of Earth's magnetopause boundary, including detection instruments and linked space weather events. Supports filtering by date range (defaults to last 30 days if no dates specified).",
    inputSchema: z.object({
        nasaApiKey: z.string().optional().describe("NASA API key (injected when connected; only sent to api.nasa.gov endpoints)"),
        endDate: z.string().optional().describe("End date for MPC data retrieval in YYYY-MM-DD format (e.g., '2024-01-31'). Defaults to current UTC date if not provided."),
        startDate: z.string().optional().describe("Start date for MPC data retrieval in YYYY-MM-DD format (e.g., '2024-01-01'). Defaults to 30 days prior to current UTC date if not provided."),
    }),
    execute: async ({ nasaApiKey, endDate, startDate }) => {
        const missing = requireApiKey(nasaApiKey);
        if (missing) return missing;
        try {
            const query: Record<string, unknown> = {};
            if (startDate !== undefined) query["startDate"] = startDate;
            if (endDate !== undefined) query["endDate"] = endDate;
            query['api_key'] = nasaApiKey;
return await nasaGet("https://api.nasa.gov", `/DONKI/MPC`, { query });
        } catch (error) {
            return toNasaError(error, "Failed to get donki mpc");
        }
    },
});

export const nasaGetDonkiNotifications = tool({
    description: "Tool to retrieve space weather notifications from NASA's DONKI (Space Weather Database Of Notifications, Knowledge, Information). Returns alerts, watches, and advisories for various space weather events including solar flares, CMEs, geomagnetic storms, and more. Use when you need comprehensive space weather notifications and forecasts for mission planning or space weather analysis.",
    inputSchema: z.object({
        nasaApiKey: z.string().optional().describe("NASA API key (injected when connected; only sent to api.nasa.gov endpoints)"),
        type: z.enum(["all", "FLR", "SEP", "CME", "IPS", "MPC", "GST", "RBE", "report"]).optional().describe("Valid notification types for DONKI database."),
        endDate: z.string().optional().describe("End date for notifications in YYYY-MM-DD format (e.g., '2024-01-31'). If not provided, defaults to current date. Maximum range between startDate and endDate is 30 days."),
        startDate: z.string().optional().describe("Start date for notifications in YYYY-MM-DD format (e.g., '2024-01-01'). If not provided, defaults to 7 days prior to current date. Maximum range between startDate and endDate is 30 days."),
    }),
    execute: async ({ nasaApiKey, type, endDate, startDate }) => {
        const missing = requireApiKey(nasaApiKey);
        if (missing) return missing;
        try {
            const query: Record<string, unknown> = {};
            if (startDate !== undefined) query["startDate"] = startDate;
            if (endDate !== undefined) query["endDate"] = endDate;
            if (type !== undefined) query["type"] = type;
            query['api_key'] = nasaApiKey;
return await nasaGet("https://api.nasa.gov", `/DONKI/notifications`, { query });
        } catch (error) {
            return toNasaError(error, "Failed to get donki notifications");
        }
    },
});

export const nasaGetDonkiRbe = tool({
    description: "Retrieves Radiation Belt Enhancement (RBE) events from NASA's DONKI Space Weather Database. Returns event details including detection instruments, timestamps, related activities, and notification alerts. Use this when you need to track radiation belt enhancements affecting Earth's magnetosphere within a specific date range.",
    inputSchema: z.object({
        nasaApiKey: z.string().optional().describe("NASA API key (injected when connected; only sent to api.nasa.gov endpoints)"),
        endDate: z.string().optional().describe("End date for the search in YYYY-MM-DD format (e.g., '2025-02-15'). Defaults to current date if not provided."),
        startDate: z.string().optional().describe("Start date for the search in YYYY-MM-DD format (e.g., '2025-01-15'). Defaults to 30 days prior to current date if not provided."),
    }),
    execute: async ({ nasaApiKey, endDate, startDate }) => {
        const missing = requireApiKey(nasaApiKey);
        if (missing) return missing;
        try {
            const query: Record<string, unknown> = {};
            if (startDate !== undefined) query["startDate"] = startDate;
            if (endDate !== undefined) query["endDate"] = endDate;
            query['api_key'] = nasaApiKey;
return await nasaGet("https://api.nasa.gov", `/DONKI/RBE`, { query });
        } catch (error) {
            return toNasaError(error, "Failed to get donki rbe");
        }
    },
});

export const nasaGetDonkiSep = tool({
    description: "Get Solar Energetic Particle (SEP) events from NASA's DONKI space weather database. Returns detailed information about SEP events including detection instruments, linked solar events (flares, CMEs), notification alerts, and event metadata. Use this when you need space weather data about solar energetic particles detected by instruments like GOES, SOHO, and STEREO.",
    inputSchema: z.object({
        nasaApiKey: z.string().optional().describe("NASA API key (injected when connected; only sent to api.nasa.gov endpoints)"),
        endDate: z.string().optional().describe("End date for SEP event search in YYYY-MM-DD format (e.g., '2024-02-15'). Returns SEP events detected on or before this date. If not provided, defaults to current date."),
        startDate: z.string().optional().describe("Start date for SEP event search in YYYY-MM-DD format (e.g., '2024-01-15'). Returns SEP events detected on or after this date. If not provided, defaults to 30 days prior to current date."),
    }),
    execute: async ({ nasaApiKey, endDate, startDate }) => {
        const missing = requireApiKey(nasaApiKey);
        if (missing) return missing;
        try {
            const query: Record<string, unknown> = {};
            if (startDate !== undefined) query["startDate"] = startDate;
            if (endDate !== undefined) query["endDate"] = endDate;
            query['api_key'] = nasaApiKey;
return await nasaGet("https://api.nasa.gov", `/DONKI/SEP`, { query });
        } catch (error) {
            return toNasaError(error, "Failed to get donki sep");
        }
    },
});

export const nasaGetDonkiSolarFlares = tool({
    description: "Tool to retrieve Solar Flare (FLR) events from NASA's DONKI (Space Weather Database Of Notifications, Knowledge, Information). Use when you need data about solar flares including their classification (B, C, M, X-class), timing (begin/peak/end), source location, and associated instruments. Returns events within the specified date range, defaulting to the last 30 days if no dates provided.",
    inputSchema: z.object({
        nasaApiKey: z.string().optional().describe("NASA API key (injected when connected; only sent to api.nasa.gov endpoints)"),
        endDate: z.string().optional().describe("End date for the search in YYYY-MM-DD format (e.g., '2024-01-31'). Defaults to current UTC date if not specified."),
        startDate: z.string().optional().describe("Start date for the search in YYYY-MM-DD format (e.g., '2024-01-01'). Defaults to 30 days prior to current UTC date if not specified."),
    }),
    execute: async ({ nasaApiKey, endDate, startDate }) => {
        const missing = requireApiKey(nasaApiKey);
        if (missing) return missing;
        try {
            const query: Record<string, unknown> = {};
            if (startDate !== undefined) query["startDate"] = startDate;
            if (endDate !== undefined) query["endDate"] = endDate;
            query['api_key'] = nasaApiKey;
return await nasaGet("https://api.nasa.gov", `/DONKI/FLR`, { query });
        } catch (error) {
            return toNasaError(error, "Failed to get donki solar flares");
        }
    },
});

export const nasaGetDonkiWsaEnlil = tool({
    description: "Retrieve WSA-ENLIL solar wind model simulation data from NASA's DONKI system. Returns simulations modeling interplanetary CME propagation with predicted Earth impacts, shock arrival times, and Kp indices. Use when forecasting space weather effects from coronal mass ejections or researching CME propagation patterns.",
    inputSchema: z.object({
        nasaApiKey: z.string().optional().describe("NASA API key (injected when connected; only sent to api.nasa.gov endpoints)"),
        endDate: z.string().optional().describe("End date for simulations in YYYY-MM-DD format (e.g., '2024-01-31'). If not provided, defaults to current UTC date."),
        startDate: z.string().optional().describe("Start date for simulations in YYYY-MM-DD format (e.g., '2024-01-01'). If not provided, defaults to 7 days prior to current UTC date."),
    }),
    execute: async ({ nasaApiKey, endDate, startDate }) => {
        const missing = requireApiKey(nasaApiKey);
        if (missing) return missing;
        try {
            const query: Record<string, unknown> = {};
            if (startDate !== undefined) query["startDate"] = startDate;
            if (endDate !== undefined) query["endDate"] = endDate;
            query['api_key'] = nasaApiKey;
return await nasaGet("https://api.nasa.gov", `/DONKI/WSAEnlilSimulation`, { query });
        } catch (error) {
            return toNasaError(error, "Failed to get donki wsa enlil");
        }
    },
});
