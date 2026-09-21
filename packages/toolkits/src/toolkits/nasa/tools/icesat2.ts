// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { nasaGetText, nasaGet, toNasaError, enc } from './client.js';

export const nasaGetIcesat2Tracks = tool({
    description: "Retrieves a list of ICESat-2 satellite tracks (Reference Ground Tracks - RGTs) within a specified geographic bounding box. Use this when you need to identify which ICESat-2 tracks pass through a particular region of interest. The returned track identifiers can be used to query detailed altimetry data for those specific tracks. Supports optional date filtering to find tracks from a specific collection date.",
    inputSchema: z.object({
        nasaApiKey: z.string().optional().describe("NASA API key (injected when connected; only sent to api.nasa.gov endpoints)"),
        date: z.string().optional().describe("Data collection date filter in yyyy-MM-dd format (e.g., '2019-12-25'). If specified, only tracks from this date will be returned."),
        maxx: z.number().optional().describe("Maximum x coordinate (longitude) of the bounding box in decimal degrees. Eastern boundary of the area of interest."),
        maxy: z.number().optional().describe("Maximum y coordinate (latitude) of the bounding box in decimal degrees. Northern boundary of the area of interest."),
        minx: z.number().optional().describe("Minimum x coordinate (longitude) of the bounding box in decimal degrees. Western boundary of the area of interest."),
        miny: z.number().optional().describe("Minimum y coordinate (latitude) of the bounding box in decimal degrees. Southern boundary of the area of interest."),
        outputFormat: z.enum(["csv", "json"]).optional().describe("Output format of the result. 'json' returns structured JSON data, 'csv' returns comma-separated values."),
    }),
    execute: async ({ nasaApiKey, date, maxx, maxy, minx, miny, outputFormat }) => {
        try {
            const query: Record<string, unknown> = {};
            if (minx !== undefined) query["minx"] = minx;
            if (miny !== undefined) query["miny"] = miny;
            if (maxx !== undefined) query["maxx"] = maxx;
            if (maxy !== undefined) query["maxy"] = maxy;
            if (date !== undefined) query["date"] = date;
            if (outputFormat !== undefined) query["outputFormat"] = outputFormat;
            const fmt = (outputFormat ?? 'json').toLowerCase();
            if (fmt === 'csv') return await nasaGetText("https://openaltimetry.earthdatacloud.nasa.gov/data", `/api/icesat2/getTracks`, { query });
            return await nasaGet("https://openaltimetry.earthdatacloud.nasa.gov/data", `/api/icesat2/getTracks`, { query });
        } catch (error) {
            return toNasaError(error, "Failed to get icesat2 tracks");
        }
    },
});

export const nasaGetLevel3Data = tool({
    description: "Tool to access ICESat-2 Level-3A product data from OpenAltimetry. Use when you need satellite altimetry measurements for land ice, sea ice, vegetation, ocean surface, or inland water surface heights. Requests are limited to 5x5 degree spatial bounding box selection and up to 1 year of data. Note: This endpoint is marked as COMING SOON in documentation but is functionally operational.",
    inputSchema: z.object({
        nasaApiKey: z.string().optional().describe("NASA API key (injected when connected; only sent to api.nasa.gov endpoints)"),
        maxx: z.number().describe("Maximum longitude (x-coordinate) for the bounding box in decimal degrees. Must define a bounding box no larger than 5x5 degrees."),
        maxy: z.number().describe("Maximum latitude (y-coordinate) for the bounding box in decimal degrees. Must define a bounding box no larger than 5x5 degrees."),
        minx: z.number().describe("Minimum longitude (x-coordinate) for the bounding box in decimal degrees. Must define a bounding box no larger than 5x5 degrees."),
        miny: z.number().describe("Minimum latitude (y-coordinate) for the bounding box in decimal degrees. Must define a bounding box no larger than 5x5 degrees."),
        client: z.string().optional().describe("Referring client identifier for API usage tracking purposes."),
        endDate: z.string().optional().describe("End date for temporal filtering in YYYY-MM-DD format. Filters data to include only observations on or before this date."),
        product: z.enum(["atl06", "atl07", "atl08", "atl10", "atl12", "atl13"]).describe("ICESat-2 data product type to retrieve. Options: atl06 (Land Ice Height), atl07 (Sea Ice Height), atl08 (Land and Vegetation Height), atl10 (Sea Ice Freeboard), atl12 (Ocean Surface Height), atl13 (Inland Water Surface Height)."),
        trackId: z.number().int().describe("Reference ground track ID for ICESat-2 satellite track to retrieve data from."),
        beamNames: z.array(z.string()).optional().describe("List of specific beam names to filter results. ICESat-2 has 6 beams: gt1l, gt1r, gt2l, gt2r, gt3l, gt3r."),
        startDate: z.string().optional().describe("Start date for temporal filtering in YYYY-MM-DD format. Filters data to include only observations on or after this date."),
        outputFormat: z.enum(["csv", "json", "zip"]).optional().describe("Output format for the Level-3A data."),
        date: z.string().optional().describe("Date in YYYY-MM-DD format. Defaults to startDate when omitted."),
    }),
    execute: async ({ nasaApiKey, product, minx, miny, maxx, maxy, trackId, client, endDate, beamNames, startDate, outputFormat, date }) => {
        try {
            const query: Record<string, unknown> = {};
            if (date !== undefined) query["date"] = date;
            if (minx !== undefined) query["minx"] = minx;
            if (miny !== undefined) query["miny"] = miny;
            if (maxx !== undefined) query["maxx"] = maxx;
            if (maxy !== undefined) query["maxy"] = maxy;
            if (trackId !== undefined) query["trackId"] = trackId;
            if (outputFormat !== undefined) query["outputFormat"] = outputFormat;
            if (client !== undefined) query["client"] = client;
            if (startDate !== undefined) query["startDate"] = startDate;
            if (endDate !== undefined) query["endDate"] = endDate;
            if (date !== undefined) query["date"] = date;
            else if (startDate !== undefined) query["date"] = startDate;
            if (beamNames !== undefined) query['beamNames'] = beamNames.join(',');
            const fmt = String(outputFormat ?? 'json').toLowerCase();
            if (fmt === 'json') return await nasaGet("https://openaltimetry.earthdatacloud.nasa.gov/data", `/api/icesat2/${enc(product)}`, { query });
            return await nasaGetText("https://openaltimetry.earthdatacloud.nasa.gov/data", `/api/icesat2/${enc(product)}`, { query });
        } catch (error) {
            return toNasaError(error, "Failed to get level3 data");
        }
    },
});
