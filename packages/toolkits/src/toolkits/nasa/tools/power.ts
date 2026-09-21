// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { nasaGet, nasaGetText, toNasaError } from './client.js';

export const nasaGetPowerClimatology = tool({
    description: "Retrieves long-term climatology data for a specific location from NASA POWER (Prediction Of Worldwide Energy Resources). Returns average values over a climate period, including monthly and annual climate statistics for parameters like temperature, solar radiation, wind speed, and precipitation. Use this when you need long-term climate averages for renewable energy planning, sustainable building design, or agricultural applications.",
    inputSchema: z.object({
        nasaApiKey: z.string().optional().describe("NASA API key (injected when connected; only sent to api.nasa.gov endpoints)"),
        format: z.enum(["JSON", "CSV", "ASCII", "NETCDF", "ICASA", "GeoJSON"]).optional().describe("Output format types for NASA POWER API."),
        latitude: z.number().min(-90).max(90).describe("Latitude coordinate in decimal degrees. Valid range: -90 to 90."),
        community: z.enum(["RE", "SB", "AG"]).describe("User community designation. RE = Renewable Energy, SB = Sustainable Buildings, AG = Agroclimatology. Affects parameter availability and units."),
        longitude: z.number().min(-180).max(180).describe("Longitude coordinate in decimal degrees. Valid range: -180 to 180."),
        parameters: z.string().describe("Comma-separated list of POWER parameter codes (e.g., 'T2M,PRECTOTCORR,WS2M'). Maximum 20 parameters per request. Common parameters: T2M (Temperature at 2 Meters), PRECTOTCORR (Precipitation Corrected), WS2M (Wind Speed at 2 Meters), RH2M (Relative Humidity), ALLSKY_SFC_SW_DWN (Solar Radiation). Returns long-term climate averages for these parameters."),
    }),
    execute: async ({ nasaApiKey, parameters, community, longitude, latitude, format }) => {
        try {
            const query: Record<string, unknown> = {};
            if (format !== undefined) query["format"] = format;
            if (latitude !== undefined) query["latitude"] = latitude;
            if (community !== undefined) query["community"] = community;
            if (longitude !== undefined) query["longitude"] = longitude;
            if (parameters !== undefined) query["parameters"] = parameters;
            if (format === undefined || format === 'JSON') {
                const q2 = { ...query, format: 'JSON' };
                return await nasaGet("https://power.larc.nasa.gov", `/api/temporal/climatology/point`, { query: q2 });
            }
            const q2 = { ...query };
            return await nasaGetText("https://power.larc.nasa.gov", `/api/temporal/climatology/point`, { query: q2 });
        } catch (error) {
            return toNasaError(error, "Failed to get power climatology");
        }
    },
});

export const nasaGetPowerDaily = tool({
    description: "Retrieves daily average solar and meteorological data from NASA POWER (Prediction Of Worldwide Energy Resources). Returns time-series data for parameters like temperature, solar radiation, wind speed, humidity, and precipitation from 1981 to near real-time. Use this when you need historical or recent climate data for a specific location to support renewable energy planning, building design, or agricultural applications.",
    inputSchema: z.object({
        nasaApiKey: z.string().optional().describe("NASA API key (injected when connected; only sent to api.nasa.gov endpoints)"),
        end: z.string().describe("End date in YYYYMMDD format (e.g., '20240107'). Must be on or after start date."),
        start: z.string().describe("Start date in YYYYMMDD format (e.g., '20240101'). Valid range: 19810101 to near real-time."),
        format: z.enum(["JSON", "GeoJSON"]).optional().describe("Output format types for NASA POWER API. Only JSON-based formats are supported."),
        latitude: z.number().min(-90).max(90).describe("Latitude coordinate in decimal degrees. Valid range: -90 to 90."),
        community: z.enum(["RE", "SB", "AG"]).describe("User community designation. RE = Renewable Energy, SB = Sustainable Buildings, AG = Agroclimatology. Affects parameter availability and units."),
        longitude: z.number().min(-180).max(180).describe("Longitude coordinate in decimal degrees. Valid range: -180 to 180."),
        parameters: z.string().describe("Comma-separated list of POWER parameter codes (e.g., 'T2M,PRECTOTCORR,WS2M'). Maximum 20 parameters per request. Common parameters: T2M (Temperature at 2 Meters), PRECTOTCORR (Precipitation Corrected), WS2M (Wind Speed at 2 Meters), RH2M (Relative Humidity), ALLSKY_SFC_SW_DWN (Solar Radiation)."),
    }),
    execute: async ({ nasaApiKey, parameters, community, longitude, latitude, start, end, format }) => {
        try {
            const query: Record<string, unknown> = {};
            if (end !== undefined) query["end"] = end;
            if (start !== undefined) query["start"] = start;
            if (format !== undefined) query["format"] = format;
            if (latitude !== undefined) query["latitude"] = latitude;
            if (community !== undefined) query["community"] = community;
            if (longitude !== undefined) query["longitude"] = longitude;
            if (parameters !== undefined) query["parameters"] = parameters;
            if (format === undefined || format === 'JSON') {
                const q2 = { ...query, format: 'JSON' };
                return await nasaGet("https://power.larc.nasa.gov", `/api/temporal/daily/point`, { query: q2 });
            }
            const q2 = { ...query };
            return await nasaGetText("https://power.larc.nasa.gov", `/api/temporal/daily/point`, { query: q2 });
        } catch (error) {
            return toNasaError(error, "Failed to get power daily");
        }
    },
});

export const nasaGetPowerDailyRegional = tool({
    description: "Tool to retrieve daily average solar and meteorological data for a regional bounding box from NASA POWER (Prediction Of Worldwide Energy Resources). Use when you need historical or recent climate data for a geographic region (not just a single point). Returns time-series data on a 0.5 x 0.5 degree grid for parameters like temperature, solar radiation, wind speed, humidity, and precipitation from 1981 to near real-time. Regional requests require at least a 2-degree range in both latitude and longitude, and are limited to ONE parameter per request.",
    inputSchema: z.object({
        nasaApiKey: z.string().optional().describe("NASA API key (injected when connected; only sent to api.nasa.gov endpoints)"),
        end: z.string().describe("End date in YYYYMMDD format (e.g., '20230107'). Must be on or after start date."),
        start: z.string().describe("Start date in YYYYMMDD format (e.g., '20230101'). Valid range: 19810101 to near real-time."),
        format: z.enum(["JSON", "CSV", "ASCII", "NETCDF", "ICASA"]).optional().describe("Output format types for NASA POWER API."),
        community: z.enum(["RE", "SB", "AG"]).describe("User community designation. RE = Renewable Energy, SB = Sustainable Buildings, AG = Agroclimatology. Affects parameter availability and units."),
        parameters: z.string().describe("Single POWER parameter code to retrieve (e.g., 'T2M', 'PRECTOTCORR', 'WS2M'). Regional requests are limited to ONE parameter per submission. Common parameters: T2M (Temperature at 2 Meters), PRECTOTCORR (Precipitation Corrected), WS2M (Wind Speed at 2 Meters), RH2M (Relative Humidity), ALLSKY_SFC_SW_DWN (Solar Radiation)."),
        latitudeMax: z.number().min(-90).max(90).describe("Maximum latitude of the bounding box in decimal degrees. Valid range: -90 to 90. Must be at least 2 degrees greater than latitude_min."),
        latitudeMin: z.number().min(-90).max(90).describe("Minimum latitude of the bounding box in decimal degrees. Valid range: -90 to 90. Must be at least 2 degrees less than latitude_max."),
        longitudeMax: z.number().min(-180).max(180).describe("Maximum longitude of the bounding box in decimal degrees. Valid range: -180 to 180. Must be at least 2 degrees greater than longitude_min."),
        longitudeMin: z.number().min(-180).max(180).describe("Minimum longitude of the bounding box in decimal degrees. Valid range: -180 to 180. Must be at least 2 degrees less than longitude_max."),
    }),
    execute: async ({ nasaApiKey, latitudeMin, latitudeMax, longitudeMin, longitudeMax, parameters, community, start, end, format }) => {
        try {
            const query: Record<string, unknown> = {};
            if (end !== undefined) query["end"] = end;
            if (start !== undefined) query["start"] = start;
            if (format !== undefined) query["format"] = format;
            if (community !== undefined) query["community"] = community;
            if (parameters !== undefined) query["parameters"] = parameters;
            if (latitudeMax !== undefined) query["latitude-max"] = latitudeMax;
            if (latitudeMin !== undefined) query["latitude-min"] = latitudeMin;
            if (longitudeMax !== undefined) query["longitude-max"] = longitudeMax;
            if (longitudeMin !== undefined) query["longitude-min"] = longitudeMin;
            if (format === undefined || format === 'JSON') {
                const q2 = { ...query, format: 'JSON' };
                return await nasaGet("https://power.larc.nasa.gov", `/api/temporal/daily/regional`, { query: q2 });
            }
            const q2 = { ...query };
            return await nasaGetText("https://power.larc.nasa.gov", `/api/temporal/daily/regional`, { query: q2 });
        } catch (error) {
            return toNasaError(error, "Failed to get power daily regional");
        }
    },
});

export const nasaGetPowerMonthly = tool({
    description: "Retrieves monthly average solar and meteorological data for a specific location from NASA POWER (Prediction Of Worldwide Energy Resources). Returns time series data with monthly averages organized by year-month for parameters like temperature, precipitation, solar irradiance, and humidity. Use this when you need long-term climate analysis, renewable energy assessments, or agricultural planning data for a specific geographic location. Data availability generally ranges from 1981 to near real-time depending on the parameter.",
    inputSchema: z.object({
        nasaApiKey: z.string().optional().describe("NASA API key (injected when connected; only sent to api.nasa.gov endpoints)"),
        end: z.string().describe("End year for the data range in YYYY format (e.g., '2021'). Must be greater than or equal to start year."),
        start: z.string().describe("Start year for the data range in YYYY format (e.g., '2020'). Data availability varies by parameter but generally starts from 1981."),
        format: z.enum(["JSON", "CSV", "NETCDF", "GEOTIFF"]).optional().describe("Output format types."),
        latitude: z.number().min(-90).max(90).describe("Latitude of the location in decimal degrees. Must be between -90 and 90."),
        community: z.enum(["RE", "SB", "AG"]).describe("User community determining the parameter set and data processing. RE (Renewable Energy) for solar energy applications, SB (Sustainable Buildings) for building design, AG (Agroclimatology) for agricultural applications."),
        longitude: z.number().min(-180).max(180).describe("Longitude of the location in decimal degrees. Must be between -180 and 180."),
        parameters: z.string().describe("Comma-separated list of POWER parameter names (e.g., 'T2M,PRECTOTCORR,RH2M'). Common parameters include T2M (Temperature at 2 Meters), PRECTOTCORR (Precipitation Corrected), RH2M (Relative Humidity at 2 Meters), ALLSKY_SFC_SW_DWN (All Sky Surface Shortwave Downward Irradiance). Maximum 20 parameters per request."),
    }),
    execute: async ({ nasaApiKey, parameters, community, longitude, latitude, start, end, format }) => {
        try {
            const query: Record<string, unknown> = {};
            if (end !== undefined) query["end"] = end;
            if (start !== undefined) query["start"] = start;
            if (format !== undefined) query["format"] = format;
            if (latitude !== undefined) query["latitude"] = latitude;
            if (community !== undefined) query["community"] = community;
            if (longitude !== undefined) query["longitude"] = longitude;
            if (parameters !== undefined) query["parameters"] = parameters;
            if (format === undefined || format === 'JSON') {
                const q2 = { ...query, format: 'JSON' };
                return await nasaGet("https://power.larc.nasa.gov", `/api/temporal/monthly/point`, { query: q2 });
            }
            const q2 = { ...query };
            return await nasaGetText("https://power.larc.nasa.gov", `/api/temporal/monthly/point`, { query: q2 });
        } catch (error) {
            return toNasaError(error, "Failed to get power monthly");
        }
    },
});

export const nasaGetPowerTemporalHourly = tool({
    description: "Retrieves hourly climate and meteorological data from NASA POWER (Prediction of Worldwide Energy Resources) API for a specific location and date range. Returns high-resolution temporal data including temperature, humidity, precipitation, and other parameters. Use this when you need detailed hourly weather/climate data for renewable energy, sustainable buildings, or agroclimatology applications. Data available from 2001 to near real-time.",
    inputSchema: z.object({
        nasaApiKey: z.string().optional().describe("NASA API key (injected when connected; only sent to api.nasa.gov endpoints)"),
        end: z.string().describe("End date for hourly data retrieval in YYYYMMDD format (e.g., '20230131'). Must be on or after start date. Returns hourly data for all hours between start and end dates (inclusive)."),
        start: z.string().describe("Start date for hourly data retrieval in YYYYMMDD format (e.g., '20230101'). Available from 2001-01-01 (20010101) to near real-time. The API returns hourly data for all hours within the date range."),
        format: z.enum(["JSON", "CSV", "ASCII", "ICASA", "NETCDF"]).optional().describe("Output format options for POWER API."),
        latitude: z.number().min(-90).max(90).describe("Latitude coordinate of the location in decimal degrees. Must be between -90 and 90. Negative values represent south, positive values represent north."),
        community: z.enum(["RE", "SB", "AG"]).describe("User community for the data request. Options: 'RE' (Renewable Energy), 'SB' (Sustainable Buildings), 'AG' (Agroclimatology). Each community may have different available parameters."),
        longitude: z.number().min(-180).max(180).describe("Longitude coordinate of the location in decimal degrees. Must be between -180 and 180. Negative values represent west, positive values represent east."),
        parameters: z.string().describe("Comma-separated list of POWER parameters to retrieve (e.g., 'T2M', 'RH2M', 'PRECTOTCORR', 'T2M,RH2M'). T2M = Temperature at 2 Meters, RH2M = Relative Humidity at 2 Meters, PRECTOTCORR = Precipitation Corrected. Consult POWER documentation for full parameter list."),
        timeStandard: z.enum(["UTC", "LST"]).optional().describe("Time standard for hourly data."),
    }),
    execute: async ({ nasaApiKey, parameters, community, longitude, latitude, start, end, format, timeStandard }) => {
        try {
            const query: Record<string, unknown> = {};
            if (end !== undefined) query["end"] = end;
            if (start !== undefined) query["start"] = start;
            if (format !== undefined) query["format"] = format;
            if (latitude !== undefined) query["latitude"] = latitude;
            if (community !== undefined) query["community"] = community;
            if (longitude !== undefined) query["longitude"] = longitude;
            if (parameters !== undefined) query["parameters"] = parameters;
            if (timeStandard !== undefined) query["time_standard"] = timeStandard;
            if (format === undefined || format === 'JSON') {
                const q2 = { ...query, format: 'JSON' };
                return await nasaGet("https://power.larc.nasa.gov", `/api/temporal/hourly/point`, { query: q2 });
            }
            const q2 = { ...query };
            return await nasaGetText("https://power.larc.nasa.gov", `/api/temporal/hourly/point`, { query: q2 });
        } catch (error) {
            return toNasaError(error, "Failed to get power temporal hourly");
        }
    },
});
