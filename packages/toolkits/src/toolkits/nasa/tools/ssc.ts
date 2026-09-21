// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { toNasaError, sscGet, sscGraph, sscLocations, enc } from './client.js';

export const nasaCreateGraphRequest = tool({
    description: "Tool to create orbital and position graphs for NASA satellites using the Satellite Situation Center (SSC) web service. Use when you need to visualize satellite trajectories, orbits, or positions over a specific time period in various coordinate systems. The service generates graph files accessible via URLs in the response.",
    inputSchema: z.object({
        nasaApiKey: z.string().optional().describe("NASA API key (injected when connected; only sent to api.nasa.gov endpoints)"),
        satellites: z.array(z.record(z.any())).min(1).describe("List of satellites to include in the graph. Must specify at least one satellite. Each satellite needs an ID and optional resolution factor."),
        description: z.string().optional().describe("Optional description of the graph request for reference purposes."),
        graphOptions: z.object({ coordinateSystem: z.enum(["GEO", "GM", "GSE", "GSM", "SM", "GEI_TOD", "GEI_J2000"]).describe("Coordinate system for the orbit graph. Options: GEO (Geographic), GM (Geomagnetic), GSE (Geocentric Solar Ecliptic), GSM (Geocentric Solar Magnetospheric), SM (Solar Magnetic), GEI_TOD (Geocentric Equatorial Inertial True-Of-Date), GEI_J2000 (Geocentric Equatorial Inertial J2000).") }).describe("Visualization options for the orbit graph, including the coordinate system to use for displaying satellite positions."),
        timeInterval: z.object({ end: z.string().describe("End time in ISO 8601 format (e.g., '2026-02-14T01:00:00.000Z'). This is the end of the time range for the graph."), start: z.string().describe("Start time in ISO 8601 format (e.g., '2026-02-14T00:00:00.000Z'). This is the beginning of the time range for the graph.") }).describe("Time range for the graph data. Specifies the start and end times for which satellite position data should be visualized."),
    }),
    execute: async ({ nasaApiKey, timeInterval, satellites, graphOptions, description }) => {
        try {
            return await sscGraph({ time_interval: timeInterval, satellites, graph_options: graphOptions, description });
        } catch (error) {
            return toNasaError(error, "Failed to create graph request");
        }
    },
});

export const nasaGetSatelliteLocations = tool({
    description: "Retrieves satellite location data from NASA's Satellite Situation Center (SSC). Returns position coordinates for specified satellites over a time interval using configurable coordinate systems and magnetic field models. Use this when you need to track satellite positions, analyze orbital trajectories, or retrieve historical satellite location data.",
    inputSchema: z.object({
        nasaApiKey: z.string().optional().describe("NASA API key (injected when connected; only sent to api.nasa.gov endpoints)"),
        satellites: z.array(z.record(z.any())).min(1).describe("List of satellites to retrieve location data for. Each satellite requires an ID and resolution factor."),
        description: z.string().describe("Brief description of the data request for tracking purposes."),
        bFieldModel: z.object({ traceStopAltitude: z.number().int().optional().describe("Altitude in km at which to stop field line tracing. Default is 100 km."), externalBFieldModel: z.object({ keyParameterValues: z.string().optional().describe("Key parameter values for the external B-field model. Format: 'KP_X_X_X' where X is a digit 0-9. Default is 'KP_3_3_3'.") }).optional().describe("External magnetic field model parameters (Tsyganenko 89C model)."), internalBFieldModel: z.string().optional().describe("Internal magnetic field model to use. Default is 'IGRF' (International Geomagnetic Reference Field).") }).optional().describe("Magnetic field model specification."),
        timeInterval: z.object({ end: z.string().describe("End time in ISO 8601 format (e.g., '2024-01-01T01:00:00.000+0000'). Specifies the end of the time range for satellite location data."), start: z.string().describe("Start time in ISO 8601 format (e.g., '2024-01-01T00:00:00.000+0000'). Specifies the beginning of the time range for satellite location data.") }).describe("Time range for which to retrieve satellite location data."),
        outputOptions: z.object({ coordinateOptions: z.array(z.record(z.any())).min(1).describe("List of coordinate options specifying which coordinate systems and components to include in the response. Typically includes X, Y, and Z components for a coordinate system.") }).optional().describe("Output options for satellite location data."),
    }),
    execute: async ({ nasaApiKey, description, timeInterval, satellites, bFieldModel, outputOptions }) => {
        try {
            return await sscLocations({ time_interval: timeInterval, satellites, b_field_model: bFieldModel, output_options: outputOptions, description });
        } catch (error) {
            return toNasaError(error, "Failed to get satellite locations");
        }
    },
});

export const nasaListGroundStations = tool({
    description: "Retrieves the complete list of ground stations available from NASA's Satellite Situation Center (SSC). Returns metadata for each ground station including unique identifier, name, and geographic coordinates (latitude/longitude). Use this tool when you need information about SSC ground station locations for satellite tracking or geophysical research.",
    inputSchema: z.object({
        nasaApiKey: z.string().optional().describe("NASA API key (injected when connected; only sent to api.nasa.gov endpoints)"),
    }),
    execute: async ({ nasaApiKey }) => {
        try {
            const query: Record<string, unknown> = {};
            return await sscGet(`/groundStations`);
        } catch (error) {
            return toNasaError(error, "Failed to list ground stations");
        }
    },
});

export const nasaListObservatories = tool({
    description: "Tool to retrieve descriptions of all observatories available from NASA's Satellite Situation Center (SSC). Use when you need to discover available satellites, their identifiers, data availability periods, and trajectory resolutions. Returns comprehensive metadata for each observatory including time ranges and resource identifiers.",
    inputSchema: z.object({
        nasaApiKey: z.string().optional().describe("NASA API key (injected when connected; only sent to api.nasa.gov endpoints)"),
    }),
    execute: async ({ nasaApiKey }) => {
        try {
            const query: Record<string, unknown> = {};
            return await sscGet(`/observatories`);
        } catch (error) {
            return toNasaError(error, "Failed to list observatories");
        }
    },
});

export const nasaListLocationsGseGeo = tool({
    description: "Retrieves satellite/observatory location data in GSE and GEO coordinate systems from NASA's SSC (Satellite Situation Center). Returns time-series coordinate data including X, Y, Z positions, latitude, longitude, and local time for specified satellites over a time range. Use this when you need spacecraft position data for trajectory analysis or orbital tracking. Minimum time interval is 24 hours.",
    inputSchema: z.object({
        nasaApiKey: z.string().optional().describe("NASA API key (injected when connected; only sent to api.nasa.gov endpoints)"),
        satellites: z.string().describe("Comma-separated list of satellite/observatory identifiers (e.g., 'ace', 'iss', 'ace,iss'). Valid values must be from the SSC observatories list."),
        timeRange: z.string().describe("Time interval as two comma-separated ISO 8601 basic format datetime values (e.g., '20260101T000000Z,20260102T000000Z'). The interval must be at least 24 hours."),
        resolutionFactor: z.number().int().min(1).optional().describe("Controls data density by including 1 out of every resolutionFactor values. Higher values reduce the number of data points returned."),
    }),
    execute: async ({ nasaApiKey, satellites, timeRange, resolutionFactor }) => {
        try {
            const query: Record<string, unknown> = {};
            if (resolutionFactor !== undefined) query["resolution_factor"] = resolutionFactor;
            return await sscGet(`/locations/${enc(satellites)}/${enc(timeRange)}/GSE,GEO`, { query });
        } catch (error) {
            return toNasaError(error, "Failed to list locations gse geo");
        }
    },
});
