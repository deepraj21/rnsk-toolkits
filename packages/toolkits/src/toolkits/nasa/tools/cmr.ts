// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { nasaGet, toNasaError, cmrGraphql, cmrGraphqlRaw, cmrGraphqlMutation, enc } from './client.js';

export const nasaGetCmrCollections = tool({
    description: "Tool to retrieve collections from the Common Metadata Repository (CMR). Use when you need to search NASA science data collections by spatial, temporal, or metadata filters. Call after confirming search criteria.",
    inputSchema: z.object({
        nasaApiKey: z.string().optional().describe("NASA API key (injected when connected; only sent to api.nasa.gov endpoints)"),
        circle: z.string().optional().describe("Circle for spatial queries in 'lat,lon,radius' format (radius in km). Example: '34.5,-117.4,50'. Mutually exclusive with 'bounding_box' and 'polygon'."),
        keyword: z.string().optional().describe("Free-text keyword search against metadata."),
        polygon: z.string().optional().describe("Polygon for spatial queries as whitespace-separated 'lat1,lon1 lat2,lon2 ...'. Mutually exclusive with 'bounding_box' and 'circle'."),
        version: z.string().optional().describe("Version of the collection, e.g., '6'."),
        pageNum: z.number().int().min(1).optional().describe("Page number to retrieve. Default=1. If total results exceed `page_size`, increment `page_num` to retrieve subsequent pages; a single page silently omits remaining results."),
        platform: z.string().optional().describe("Acquisition platform, e.g., 'AQUA'."),
        provider: z.string().optional().describe("Data provider ID, e.g., 'LPDAAC_ECS'."),
        temporal: z.string().optional().describe("Time range in 'start,stop' ISO-8601 format, e.g. '2020-01-01T00:00:00Z,2020-12-31T23:59:59Z'."),
        pageSize: z.number().int().min(1).max(2000).optional().describe("Results per page (1-2000). Default=10."),
        conceptId: z.string().optional().describe("Exact CMR collection concept ID, e.g., 'C1234567890-LPDAAC_ECS'. Use to retrieve a single known collection."),
        instrument: z.string().optional().describe("Instrument used to acquire data, e.g., 'MODIS'."),
        shortName: z.string().optional().describe("Short name of the collection, e.g., 'MODIS_Terra'."),
        boundingBox: z.string().optional().describe("Bounding box for spatial queries in 'west,south,east,north' format. Example: '-180,-90,180,90'. Mutually exclusive with 'circle' and 'polygon'."),
    }),
    execute: async ({ nasaApiKey, circle, keyword, polygon, version, pageNum, platform, provider, temporal, pageSize, conceptId, instrument, shortName, boundingBox }) => {
        try {
            const query: Record<string, unknown> = {};
            if (keyword !== undefined) query["keyword"] = keyword;
            if (provider !== undefined) query["provider"] = provider;
            if (instrument !== undefined) query["instrument"] = instrument;
            if (platform !== undefined) query["platform"] = platform;
            if (shortName !== undefined) query["short_name"] = shortName;
            if (version !== undefined) query["version"] = version;
            if (conceptId !== undefined) query["concept_id"] = conceptId;
            if (temporal !== undefined) query["temporal"] = temporal;
            if (boundingBox !== undefined) query["bounding_box"] = boundingBox;
            if (circle !== undefined) query["circle"] = circle;
            if (polygon !== undefined) query["polygon"] = polygon;
            if (pageNum !== undefined) query["page_num"] = pageNum;
            if (pageSize !== undefined) query["page_size"] = pageSize;
return await nasaGet("https://cmr.earthdata.nasa.gov", `/search/collections.json`, { query });
        } catch (error) {
            return toNasaError(error, "Failed to get cmr collections");
        }
    },
});

export const nasaGetCmrGranules = tool({
    description: "Search for data granules in NASA's Common Metadata Repository (CMR). Granules are individual data files within a collection. REQUIRED: Specify at least one collection identifier (concept_id, provider, short_name, or version). OPTIONAL: Add spatial (bounding_box), temporal, or pagination filters to refine results. Omitting or broadening spatial/temporal filters can return extremely large datasets; always constrain both when possible. Returns metadata including download links, temporal coverage, spatial extent, and file size for each granule.",
    inputSchema: z.object({
        nasaApiKey: z.string().optional().describe("NASA API key (injected when connected; only sent to api.nasa.gov endpoints)"),
        version: z.string().optional().describe("Collection version number to filter by (e.g., '006', '061'). Often used with short_name."),
        pageNum: z.number().int().min(1).optional().describe("Page number to retrieve (starts at 1). Default: 1. Results beyond page 1 are silently omitted if pagination is not used; iterate page_num to retrieve complete result sets."),
        provider: z.string().optional().describe("Data provider/center ID to filter granules (e.g., 'LPDAAC_ECS', 'LANCEMODIS')"),
        temporal: z.string().optional().describe("Temporal range for filtering granules in 'start,end' ISO 8601 format. Examples: '2020-01-01T00:00:00Z,2020-01-31T23:59:59Z' for a range, '2020-01-01T00:00:00Z,' for open-ended from start, ',2020-01-31T23:59:59Z' for open-ended to end"),
        pageSize: z.number().int().min(1).max(2000).optional().describe("Number of results per page (1-2000). Default: 10."),
        conceptId: z.string().optional().describe("Collection concept ID to search granules within (e.g., 'C2007662107-LANCEMODIS'). This uniquely identifies a collection."),
        shortName: z.string().optional().describe("Collection short name to search granules within (e.g., 'MOD09GQ' for MODIS Terra data)"),
        boundingBox: z.string().optional().describe("Bounding box for spatial search in 'west,south,east,north' format; must be four comma-separated floats"),
    }),
    execute: async ({ nasaApiKey, version, pageNum, provider, temporal, pageSize, conceptId, shortName, boundingBox }) => {
        try {
            const query: Record<string, unknown> = {};
            if (conceptId !== undefined) query["concept_id"] = conceptId;
            if (shortName !== undefined) query["short_name"] = shortName;
            if (provider !== undefined) query["provider"] = provider;
            if (version !== undefined) query["version"] = version;
            if (temporal !== undefined) query["temporal"] = temporal;
            if (boundingBox !== undefined) query["bounding_box"] = boundingBox;
            if (pageNum !== undefined) query["page_num"] = pageNum;
            if (pageSize !== undefined) query["page_size"] = pageSize;
return await nasaGet("https://cmr.earthdata.nasa.gov", `/search/granules.json`, { query });
        } catch (error) {
            return toNasaError(error, "Failed to get cmr granules");
        }
    },
});

export const nasaGetLandingPage = tool({
    description: "Tool to retrieve the NASA STAC API landing page (root endpoint). Use when you need to discover API capabilities, available endpoints, conformance classes, or STAC version information. The landing page provides links to the API definition (OpenAPI spec) and feature collections endpoint.",
    inputSchema: z.object({
        nasaApiKey: z.string().optional().describe("NASA API key (injected when connected; only sent to api.nasa.gov endpoints)"),
    }),
    execute: async ({ nasaApiKey }) => {
        try {
return await nasaGet("https://cmr.earthdata.nasa.gov", `/stac/`);
        } catch (error) {
            return toNasaError(error, "Failed to get landing page");
        }
    },
});

export const nasaQueryCitation = tool({
    description: "Tool to query citation metadata from NASA's GraphQL Earthdata API. Use when you need to retrieve detailed citation information for a specific concept ID. Returns comprehensive metadata including DOI, abstract, provider, and revision information.",
    inputSchema: z.object({
        nasaApiKey: z.string().optional().describe("NASA API key (injected when connected; only sent to api.nasa.gov endpoints)"),
        conceptId: z.string().optional().describe("The unique concept ID assigned to the citation (e.g., 'CIT3857576156-ESDIS'). If not provided, the query returns null."),
    }),
    execute: async ({ nasaApiKey, conceptId }) => {
        try {
            const args: Record<string, unknown> = {};
            if (conceptId !== undefined) args["conceptId"] = conceptId;
            return await cmrGraphql("citation", args, "{conceptId name abstract identifier providerId revisionId}");
        } catch (error) {
            return toNasaError(error, "Failed to query citation");
        }
    },
});

export const nasaQueryCitations = tool({
    description: "Tool to query NASA Common Metadata Repository (CMR) GraphQL API for collection citations. Use when you need to retrieve citation information for NASA science data collections. The GraphQL endpoint supports flexible queries for collections and their associated citation metadata including DOIs, publication details, and relationships.",
    inputSchema: z.object({
        nasaApiKey: z.string().optional().describe("NASA API key (injected when connected; only sent to api.nasa.gov endpoints)"),
        query: z.string().describe("GraphQL query string to retrieve collections with citations. The query should request the 'collections' field with 'collectionCitations' to get citation data. Collections have a collectionCitations field (JSON) and can query GraphDbCitation relationship type with fields: abstract, id, identifier, identifierType, providerId, relationshipType, title. Example query: '{ collections(limit: 3) { items { conceptId shortName title collectionCitations } } }'"),
    }),
    execute: async ({ nasaApiKey, query }) => {
        try {
            return await cmrGraphqlRaw(query);
        } catch (error) {
            return toNasaError(error, "Failed to query citations");
        }
    },
});

export const nasaQueryCmrCollection = tool({
    description: "Tool to query a single collection from NASA's Common Metadata Repository using its unique concept ID. Use when you need to retrieve detailed metadata about a specific NASA collection including description, spatial/temporal coverage, data center, and related information.",
    inputSchema: z.object({
        nasaApiKey: z.string().optional().describe("NASA API key (injected when connected; only sent to api.nasa.gov endpoints)"),
        conceptId: z.string().describe("The unique concept ID assigned to the collection. Example: 'C2789815280-ENVIDAT'. This uniquely identifies a specific collection in NASA's CMR."),
    }),
    execute: async ({ nasaApiKey, conceptId }) => {
        try {
            const args: Record<string, unknown> = {};
            if (conceptId !== undefined) args["conceptId"] = conceptId;
            return await cmrGraphql("collection", args, "{conceptId title shortName version provider doi}");
        } catch (error) {
            return toNasaError(error, "Failed to query cmr collection");
        }
    },
});

export const nasaQueryCmrCollections = tool({
    description: "Tool to query multiple collections from NASA's Common Metadata Repository via GraphQL. Use when you need to search NASA science data collections by provider, short name, concept ID, DOI, temporal ranges, spatial coordinates, science keywords, cloud hosting status, or granule availability. Returns collection metadata including identifiers, descriptions, temporal/spatial coverage, and access information.",
    inputSchema: z.object({
        nasaApiKey: z.string().optional().describe("NASA API key (injected when connected; only sent to api.nasa.gov endpoints)"),
        doi: z.string().optional().describe("Digital Object Identifier value for the collection. Example: '10.5067/MODIS/MOD09A1.061'."),
        line: z.array(z.string()).optional().describe("Line geometries for spatial search."),
        limit: z.number().int().min(1).max(2000).optional().describe("Maximum number of collections to return. Default depends on API."),
        point: z.array(z.string()).optional().describe("Longitude/latitude coordinate pairs for spatial search. Format: 'lon,lat'."),
        circle: z.array(z.string()).optional().describe("Circle areas with center point and radius in meters (10 to 6,000,000 range). Format: 'lat,lon,radius_in_meters'. Example: ['34.5,-117.4,50000']."),
        cursor: z.string().optional().describe("Pointer to a specific position in the result list for pagination. Obtained from previous query results."),
        offset: z.number().int().min(0).optional().describe("Zero-based offset for pagination. Skip this many results before returning."),
        keyword: z.string().optional().describe("General keyword search term to search across collection metadata."),
        latency: z.array(z.string()).optional().describe("Latency facet values for filtering."),
        options: z.record(z.string()).optional().describe("CMR search logic options (and/or/wildcard) as JSON object."),
        polygon: z.array(z.string()).optional().describe("Counter-clockwise polygon coordinates for spatial search. Format: 'lat1,lon1,lat2,lon2,...'."),
        project: z.string().optional().describe("Associated project name. Example: 'EOSDIS'."),
        tagKey: z.array(z.string()).optional().describe("Associated tag identifiers for filtering."),
        version: z.string().optional().describe("Collection version number. Example: '6', '061'."),
        entryId: z.array(z.string()).optional().describe("Collection entry identifiers."),
        platform: z.string().optional().describe("Associated platform name. Example: 'AQUA', 'Terra'."),
        provider: z.string().optional().describe("Provider name. Example: 'LPDAAC_ECS', 'ORNL_DAAC'."),
        sortKey: z.array(z.string()).optional().describe("Sort criteria for results. Use '-' prefix for descending order. Example: ['-revisionDate', 'shortName']."),
        temporal: z.string().optional().describe("Temporal range filter in ISO 8601 format. Example: '2020-01-01T00:00:00Z,2020-12-31T23:59:59Z'."),
        pageSize: z.number().int().min(1).max(2000).optional().describe("Results per page for pagination."),
        projectH: z.array(z.string()).optional().describe("Project in faceted form."),
        providers: z.array(z.string()).optional().describe("Multiple provider names for filtering."),
        conceptId: z.array(z.string()).optional().describe("Unique concept identifiers assigned to collections. Use to retrieve specific known collections. Example: ['C2789815280-ENVIDAT']."),
        consortium: z.array(z.string()).optional().describe("Consortium values associated with collections."),
        instrument: z.string().optional().describe("Associated instrument name. Example: 'MODIS'."),
        shortName: z.string().optional().describe("Collection short name identifier. Example: 'MOD09A1'."),
        dataCenter: z.string().optional().describe("Assigned data center name. Example: 'LPDAAC_ECS'."),
        entryTitle: z.string().optional().describe("Official entry title of the collection."),
        facetsSize: z.number().int().min(1).optional().describe("Number of facets returned per category when facets are requested."),
        platformsH: z.record(z.string()).optional().describe("Platform in faceted form as JSON object."),
        shortNames: z.array(z.string()).optional().describe("Multiple short names for filtering."),
        boundingBox: z.array(z.string()).optional().describe("Bounding boxes defining areas on Earth aligned with longitude and latitude. Each requires 4 comma-separated values (west,south,east,north). Example: ['-180,-90,180,90']."),
        cloudHosted: z.boolean().optional().describe("Filter to collections hosted in the cloud (AWS S3). When true, restricts results to collections with DirectDistributionInformation or tagged with gov.nasa.earthdatacloud.s3."),
        dataCenters: z.array(z.string()).optional().describe("Multiple assigned data centers to filter by."),
        hasGranules: z.boolean().optional().describe("Filter by presence (true) or absence (false) of granules in the collection."),
        includeTags: z.string().optional().describe("Request tag information with wildcard support. Example: 'gov.nasa.earthdata*'."),
        instrumentH: z.array(z.string()).optional().describe("Instrument in faceted form for hierarchical filtering."),
        serviceType: z.array(z.string()).optional().describe("UMM Service type classification."),
        dataCenterH: z.array(z.string()).optional().describe("Data center in faceted form for hierarchical filtering."),
        revisionDate: z.string().optional().describe("Collection revision timestamp for filtering by last update. ISO 8601 format."),
        updatedSince: z.string().optional().describe("Find collections revised after specified datetime in ISO 8601 format."),
        includeFacets: z.string().optional().describe("Request faceted results in response. Use 'v2' for version 2 facets."),
        hasOpendapUrl: z.boolean().optional().describe("Filter by OPeNDAP service availability."),
        spatialKeyword: z.string().optional().describe("Spatial aspect keywords for geographic filtering."),
        scienceKeywords: z.record(z.string()).optional().describe("Science keyword hierarchy terms as JSON object for precise scientific domain filtering."),
        standardProduct: z.boolean().optional().describe("Filter for Standard Product portal collections (NASA-vetted products)."),
        scienceKeywordsH: z.record(z.string()).optional().describe("Science keywords in faceted form as JSON object."),
        serviceConceptId: z.string().optional().describe("UMM Service concept identifier for filtering by associated service."),
        granuleDataFormat: z.string().optional().describe("Data format of granules within the collection. Example: 'HDF5', 'NetCDF'."),
        processingLevelId: z.string().optional().describe("Data processing level identifier. Examples: 'Level0', 'Level1', 'Level2', 'Level3', 'Level4'."),
        variableConceptId: z.string().optional().describe("UMM Variable concept identifier for filtering by associated variable."),
        collectionDataType: z.array(z.string()).optional().describe("Type classification of the collection. Examples: 'NEAR_REAL_TIME', 'SCIENCE_QUALITY'."),
        hasGranulesOrCwic: z.boolean().optional().describe("Includes collections with granules or CWIC (CEOS WGISS Integrated Catalog) tags."),
        includeHasGranules: z.boolean().optional().describe("Include granule availability flag in results."),
        granuleDataFormatH: z.array(z.string()).optional().describe("Granule data format in faceted form."),
        processingLevelIdH: z.array(z.string()).optional().describe("Processing level in faceted form."),
        twoDCoordinateSystemName: z.array(z.string()).optional().describe("2D coordinate system identifiers."),
        horizontalDataResolutionRange: z.array(z.string()).optional().describe("Horizontal resolution specification for filtering collections."),
    }),
    execute: async ({ nasaApiKey, doi, line, limit, point, circle, cursor, offset, keyword, latency, options, polygon, project, tagKey, version, entryId, platform, provider, sortKey, temporal, pageSize, projectH, providers, conceptId, consortium, instrument, shortName, dataCenter, entryTitle, facetsSize, platformsH, shortNames, boundingBox, cloudHosted, dataCenters, hasGranules, includeTags, instrumentH, serviceType, dataCenterH, revisionDate, updatedSince, includeFacets, hasOpendapUrl, spatialKeyword, scienceKeywords, standardProduct, scienceKeywordsH, serviceConceptId, granuleDataFormat, processingLevelId, variableConceptId, collectionDataType, hasGranulesOrCwic, includeHasGranules, granuleDataFormatH, processingLevelIdH, twoDCoordinateSystemName, horizontalDataResolutionRange }) => {
        try {
            const args: Record<string, unknown> = {};
            if (doi !== undefined) args["doi"] = doi;
            if (line !== undefined) args["line"] = line;
            if (limit !== undefined) args["limit"] = limit;
            if (point !== undefined) args["point"] = point;
            if (circle !== undefined) args["circle"] = circle;
            if (cursor !== undefined) args["cursor"] = cursor;
            if (offset !== undefined) args["offset"] = offset;
            if (keyword !== undefined) args["keyword"] = keyword;
            if (latency !== undefined) args["latency"] = latency;
            if (options !== undefined) args["options"] = options;
            if (polygon !== undefined) args["polygon"] = polygon;
            if (project !== undefined) args["project"] = project;
            if (tagKey !== undefined) args["tagKey"] = tagKey;
            if (version !== undefined) args["version"] = version;
            if (entryId !== undefined) args["entryId"] = entryId;
            if (platform !== undefined) args["platform"] = platform;
            if (provider !== undefined) args["provider"] = provider;
            if (sortKey !== undefined) args["sortKey"] = sortKey;
            if (temporal !== undefined) args["temporal"] = temporal;
            if (pageSize !== undefined) args["pageSize"] = pageSize;
            if (projectH !== undefined) args["projectH"] = projectH;
            if (providers !== undefined) args["providers"] = providers;
            if (conceptId !== undefined) args["conceptId"] = conceptId;
            if (consortium !== undefined) args["consortium"] = consortium;
            if (instrument !== undefined) args["instrument"] = instrument;
            if (shortName !== undefined) args["shortName"] = shortName;
            if (dataCenter !== undefined) args["dataCenter"] = dataCenter;
            if (entryTitle !== undefined) args["entryTitle"] = entryTitle;
            if (facetsSize !== undefined) args["facetsSize"] = facetsSize;
            if (platformsH !== undefined) args["platformsH"] = platformsH;
            if (shortNames !== undefined) args["shortNames"] = shortNames;
            if (boundingBox !== undefined) args["boundingBox"] = boundingBox;
            if (cloudHosted !== undefined) args["cloudHosted"] = cloudHosted;
            if (dataCenters !== undefined) args["dataCenters"] = dataCenters;
            if (hasGranules !== undefined) args["hasGranules"] = hasGranules;
            if (includeTags !== undefined) args["includeTags"] = includeTags;
            if (instrumentH !== undefined) args["instrumentH"] = instrumentH;
            if (serviceType !== undefined) args["serviceType"] = serviceType;
            if (dataCenterH !== undefined) args["dataCenterH"] = dataCenterH;
            if (revisionDate !== undefined) args["revisionDate"] = revisionDate;
            if (updatedSince !== undefined) args["updatedSince"] = updatedSince;
            if (includeFacets !== undefined) args["includeFacets"] = includeFacets;
            if (hasOpendapUrl !== undefined) args["hasOpendapUrl"] = hasOpendapUrl;
            if (spatialKeyword !== undefined) args["spatialKeyword"] = spatialKeyword;
            if (scienceKeywords !== undefined) args["scienceKeywords"] = scienceKeywords;
            if (standardProduct !== undefined) args["standardProduct"] = standardProduct;
            if (scienceKeywordsH !== undefined) args["scienceKeywordsH"] = scienceKeywordsH;
            if (serviceConceptId !== undefined) args["serviceConceptId"] = serviceConceptId;
            if (granuleDataFormat !== undefined) args["granuleDataFormat"] = granuleDataFormat;
            if (processingLevelId !== undefined) args["processingLevelId"] = processingLevelId;
            if (variableConceptId !== undefined) args["variableConceptId"] = variableConceptId;
            if (collectionDataType !== undefined) args["collectionDataType"] = collectionDataType;
            if (hasGranulesOrCwic !== undefined) args["hasGranulesOrCwic"] = hasGranulesOrCwic;
            if (includeHasGranules !== undefined) args["includeHasGranules"] = includeHasGranules;
            if (granuleDataFormatH !== undefined) args["granuleDataFormatH"] = granuleDataFormatH;
            if (processingLevelIdH !== undefined) args["processingLevelIdH"] = processingLevelIdH;
            if (twoDCoordinateSystemName !== undefined) args["twoDCoordinateSystemName"] = twoDCoordinateSystemName;
            if (horizontalDataResolutionRange !== undefined) args["horizontalDataResolutionRange"] = horizontalDataResolutionRange;
            return await cmrGraphql("collections", args, "{count items{conceptId title shortName version provider doi timeStart timeEnd} cursor}");
        } catch (error) {
            return toNasaError(error, "Failed to query cmr collections");
        }
    },
});

export const nasaQueryCmrGranule = tool({
    description: "Query for a single granule (individual data file) from NASA's Common Metadata Repository using its unique concept ID. Returns comprehensive granule metadata including cloud cover, parent collection reference, spatial/temporal information, and download links. Use when you need detailed information about a specific NASA Earth science data granule file.",
    inputSchema: z.object({
        nasaApiKey: z.string().optional().describe("NASA API key (injected when connected; only sent to api.nasa.gov endpoints)"),
        conceptId: z.string().describe("The unique concept ID assigned to the granule (e.g., 'G2185315603-LPCLOUD'). This ID uniquely identifies a specific granule in the CMR."),
    }),
    execute: async ({ nasaApiKey, conceptId }) => {
        try {
            const args: Record<string, unknown> = {};
            if (conceptId !== undefined) args["conceptId"] = conceptId;
            return await cmrGraphql("granule", args, "{conceptId title timeStart timeEnd granuleSize cloudCover dayNightFlag onlineAccessFlag producerGranuleId collectionConceptId}");
        } catch (error) {
            return toNasaError(error, "Failed to query cmr granule");
        }
    },
});

export const nasaQueryCmrGranules = tool({
    description: "Tool to query for multiple granules (individual data files) from NASA's Common Metadata Repository via GraphQL. Use when searching for specific data files within a collection. REQUIRED: Must specify at least one collection identifier (collectionConceptId, provider, shortName, or conceptId) per CMR requirements. OPTIONAL: Add spatial filters (bounding box, circle, point, polygon, line), temporal range, cloud cover, day/night flag, or pagination parameters. Returns granule metadata including concept IDs, titles, temporal coverage, access links, and file sizes.",
    inputSchema: z.object({
        nasaApiKey: z.string().optional().describe("NASA API key (injected when connected; only sent to api.nasa.gov endpoints)"),
        limit: z.number().int().min(1).max(2000).optional().describe("Maximum number of granules to return (1-2000). Default: 10."),
        cursor: z.string().optional().describe("Cursor for pagination. Use the cursor from previous response to get next page of results."),
        offset: z.number().int().min(0).optional().describe("Zero-based offset for pagination. Use with limit for paging through results."),
        spatial: z.object({ line: z.array(z.string()).optional().describe("Line(s) with intersecting coordinates as comma-separated longitude,latitude pairs. Example: ['-117.5,34.2,-118.0,34.5']"), point: z.array(z.string()).optional().describe("Point(s) as comma-separated 'longitude,latitude' pairs. Example: ['-117.5,34.2']"), circle: z.array(z.string()).optional().describe("Circle(s) as '3 comma-separated numbers: longitude of center, latitude of center, radius in meters'. Example: ['-117.5,34.2,50000']"), polygon: z.array(z.string()).optional().describe("Polygon(s) with counter-clockwise ordered points; last point should match first to close. Format: comma-separated coordinate pairs. Example: ['-180,-90,-180,90,180,90,180,-90,-180,-90']"), boundingBox: z.array(z.string()).optional().describe("Bounding box(es) as '4 comma-separated numbers: lower left longitude, lower left latitude, upper right longitude, upper right latitude'. Example: ['-180,-90,180,90']") }).optional().describe("Spatial search filters for granule queries. All coordinates use longitude,latitude order."),
        entryId: z.array(z.string()).optional().describe("Parent collection entry identifier(s)"),
        provider: z.array(z.string()).optional().describe("Data provider/center ID(s) to filter granules (e.g., 'LPCLOUD', 'LPDAAC_ECS')"),
        sortKey: z.array(z.string()).optional().describe("Field(s) to sort results by. Prepend '-' for descending order. Examples: ['startDate'], ['-endDate']"),
        temporal: z.string().optional().describe("Temporal range filter in ISO 8601 format. Examples: '2020-01-01T00:00:00Z,2020-12-31T23:59:59Z' for range, '2020-01-01T00:00:00Z,' for open-ended start"),
        conceptId: z.array(z.string()).optional().describe("Specific granule concept ID(s) to retrieve. Use for exact granule lookups."),
        shortName: z.array(z.string()).optional().describe("Collection short name(s) to search granules within (e.g., 'HLS'). Often used with provider."),
        browseOnly: z.boolean().optional().describe("If true, return only granules with browse imagery available"),
        cloudCover: z.record(z.any()).optional().describe("Cloud coverage filter as JSON with 'min' and/or 'max' keys (percentage 0-100). Example: {'min': 0, 'max': 20}"),
        onlineOnly: z.boolean().optional().describe("If true, return only granules available for online access"),
        dayNightFlag: z.string().optional().describe("Day/night classification filter. Accepted values: 'DAY', 'NIGHT', 'BOTH', 'UNSPECIFIED'"),
        collectionConceptId: z.string().optional().describe("Parent collection concept ID to filter granules (e.g., 'C1234567890-LPCLOUD'). This uniquely identifies a collection and is the recommended way to scope granule searches."),
        readableGranuleName: z.array(z.string()).optional().describe("Human-readable granule name(s) for filtering"),
    }),
    execute: async ({ nasaApiKey, limit, cursor, offset, spatial, entryId, provider, sortKey, temporal, conceptId, shortName, browseOnly, cloudCover, onlineOnly, dayNightFlag, collectionConceptId, readableGranuleName }) => {
        try {
            const args: Record<string, unknown> = {};
            if (limit !== undefined) args["limit"] = limit;
            if (cursor !== undefined) args["cursor"] = cursor;
            if (offset !== undefined) args["offset"] = offset;
            if (spatial !== undefined) { for (const [k, v] of Object.entries(spatial)) args[k] = v; }
            if (entryId !== undefined) args["entryId"] = entryId;
            if (provider !== undefined) args["provider"] = provider;
            if (sortKey !== undefined) args["sortKey"] = sortKey;
            if (temporal !== undefined) args["temporal"] = temporal;
            if (conceptId !== undefined) args["conceptId"] = conceptId;
            if (shortName !== undefined) args["shortName"] = shortName;
            if (browseOnly !== undefined) args["browseOnly"] = browseOnly;
            if (cloudCover !== undefined) args["cloudCover"] = cloudCover;
            if (onlineOnly !== undefined) args["onlineOnly"] = onlineOnly;
            if (dayNightFlag !== undefined) args["dayNightFlag"] = dayNightFlag;
            if (collectionConceptId !== undefined) args["collectionConceptId"] = collectionConceptId;
            if (readableGranuleName !== undefined) args["readableGranuleName"] = readableGranuleName;
            return await cmrGraphql("granules", args, "{count items{conceptId title timeStart timeEnd granuleSize cloudCover dayNightFlag onlineAccessFlag producerGranuleId collectionConceptId} cursor}");
        } catch (error) {
            return toNasaError(error, "Failed to query cmr granules");
        }
    },
});

export const nasaQueryCmrGrids = tool({
    description: "Query for multiple grids from NASA's Common Metadata Repository (CMR) via GraphQL. Grids describe spatial data organization and coordinate systems used in NASA Earth observation datasets. Use when you need to retrieve grid metadata including spatial extent, resolution, and organization information.",
    inputSchema: z.object({
        nasaApiKey: z.string().optional().describe("NASA API key (injected when connected; only sent to api.nasa.gov endpoints)"),
        limit: z.number().int().min(1).max(100).optional().describe("Maximum number of results to return per page (1-100). If not specified, API default is used."),
        cursor: z.string().optional().describe("Pagination cursor from a previous query. Use to fetch the next page of results."),
        conceptId: z.string().optional().describe("Filter by specific grid concept ID. Use to retrieve a specific grid."),
    }),
    execute: async ({ nasaApiKey, limit, cursor, conceptId }) => {
        try {
            const args: Record<string, unknown> = {};
            if (limit !== undefined) args["limit"] = limit;
            if (cursor !== undefined) args["cursor"] = cursor;
            if (conceptId !== undefined) args["conceptId"] = conceptId;
            return await cmrGraphql("grids", args, "{count items{conceptId name description version} cursor}");
        } catch (error) {
            return toNasaError(error, "Failed to query cmr grids");
        }
    },
});

export const nasaQueryCmrService = tool({
    description: "Tool to query a single service from NASA's Common Metadata Repository using its unique concept ID. Use when you need to retrieve detailed metadata about a specific NASA service including description, type, URL, supported reformattings, and related information.",
    inputSchema: z.object({
        nasaApiKey: z.string().optional().describe("NASA API key (injected when connected; only sent to api.nasa.gov endpoints)"),
        conceptId: z.string().describe("The unique concept ID assigned to the service. Example: 'S3385907677-GES_DISC'. This uniquely identifies a specific service in NASA's CMR."),
    }),
    execute: async ({ nasaApiKey, conceptId }) => {
        try {
            const args: Record<string, unknown> = {};
            if (conceptId !== undefined) args["conceptId"] = conceptId;
            return await cmrGraphql("service", args, "{conceptId name longName description type url}");
        } catch (error) {
            return toNasaError(error, "Failed to query cmr service");
        }
    },
});

export const nasaQueryCmrServices = tool({
    description: "Tool to query for multiple services from NASA's Common Metadata Repository via GraphQL. Services describe data access methods and tools that act on data files. Use when you need to search for NASA services by type, provider, keyword, or other metadata filters.",
    inputSchema: z.object({
        nasaApiKey: z.string().optional().describe("NASA API key (injected when connected; only sent to api.nasa.gov endpoints)"),
        type: z.string().optional().describe("The type of the service. Example: 'OPeNDAP', 'ESI', 'WMS'."),
        limit: z.number().int().min(1).max(2000).optional().describe("The number of services requested. Valid range: 1-2000. Default: 10."),
        cursor: z.string().optional().describe("Cursor that points to a specific position in a list of requested records. Use the cursor from previous response to get next page of results."),
        offset: z.number().int().min(0).optional().describe("Zero-based offset of individual results. Use with limit for pagination."),
        keyword: z.string().optional().describe("Keyword search value to search across service metadata."),
        provider: z.string().optional().describe("The name of the provider associated with the service. Example: 'GES_DISC', 'LPDAAC_ECS'."),
        sortKey: z.array(z.string()).optional().describe("One or more sort keys to impact searching. Fields can be prepended with '-' for descending order. Ascending order is default but '+' can be used explicitly. Example: ['name'], ['-revisionDate']."),
        conceptId: z.array(z.string()).optional().describe("The unique concept ID(s) assigned to the service. Example: ['S3385907677-GES_DISC']. Use for exact service lookups."),
    }),
    execute: async ({ nasaApiKey, type, limit, cursor, offset, keyword, provider, sortKey, conceptId }) => {
        try {
            const args: Record<string, unknown> = {};
            if (type !== undefined) args["type"] = type;
            if (limit !== undefined) args["limit"] = limit;
            if (cursor !== undefined) args["cursor"] = cursor;
            if (offset !== undefined) args["offset"] = offset;
            if (keyword !== undefined) args["keyword"] = keyword;
            if (provider !== undefined) args["provider"] = provider;
            if (sortKey !== undefined) args["sortKey"] = sortKey;
            if (conceptId !== undefined) args["conceptId"] = conceptId;
            return await cmrGraphql("services", args, "{count items{conceptId name longName description type providerId} cursor}");
        } catch (error) {
            return toNasaError(error, "Failed to query cmr services");
        }
    },
});

export const nasaQueryCmrSubscription = tool({
    description: "Tool to query a single subscription from NASA's Common Metadata Repository using its unique concept ID. Use when you need to retrieve detailed metadata about a specific CMR subscription including name, native ID, associated collection, and query parameters.",
    inputSchema: z.object({
        nasaApiKey: z.string().optional().describe("NASA API key (injected when connected; only sent to api.nasa.gov endpoints)"),
        conceptId: z.string().describe("The unique concept ID assigned to the subscription. Example: 'SUB1200000000-PROV'. This uniquely identifies a specific subscription in NASA's CMR."),
    }),
    execute: async ({ nasaApiKey, conceptId }) => {
        try {
            const args: Record<string, unknown> = {};
            if (conceptId !== undefined) args["conceptId"] = conceptId;
            return await cmrGraphql("subscription", args, "{conceptId name collectionConceptId providerId}");
        } catch (error) {
            return toNasaError(error, "Failed to query cmr subscription");
        }
    },
});

export const nasaQueryCmrSubscriptions = tool({
    description: "Query for multiple subscriptions from NASA's Common Metadata Repository (CMR). Use when you need to retrieve user subscriptions for receiving notifications when new data matching specified criteria becomes available. Returns subscription details including concept IDs, names, query criteria, and notification email addresses.",
    inputSchema: z.object({
        nasaApiKey: z.string().optional().describe("NASA API key (injected when connected; only sent to api.nasa.gov endpoints)"),
        limit: z.number().int().min(1).max(100).optional().describe("Maximum number of results to return per page (1-100). If not specified, API default is used."),
        cursor: z.string().optional().describe("Pagination cursor returned from a previous query. Use this to fetch the next page of results."),
    }),
    execute: async ({ nasaApiKey, limit, cursor }) => {
        try {
            const args: Record<string, unknown> = {};
            if (limit !== undefined) args["limit"] = limit;
            if (cursor !== undefined) args["cursor"] = cursor;
            return await cmrGraphql("subscriptions", args, "{count items{conceptId name collectionConceptId providerId query} cursor}");
        } catch (error) {
            return toNasaError(error, "Failed to query cmr subscriptions");
        }
    },
});

export const nasaQueryCmrTool = tool({
    description: "Tool to query a single tool from NASA's Common Metadata Repository using its unique concept ID. Use when you need to retrieve detailed metadata about a specific NASA tool including long name, description, and URL. Call this when you have a tool concept ID and need to fetch its full metadata.",
    inputSchema: z.object({
        nasaApiKey: z.string().optional().describe("NASA API key (injected when connected; only sent to api.nasa.gov endpoints)"),
        conceptId: z.string().describe("The unique concept ID assigned to the tool. Example: 'TL1860342065-SCIOPS'. This uniquely identifies a specific tool in NASA's CMR."),
    }),
    execute: async ({ nasaApiKey, conceptId }) => {
        try {
            const args: Record<string, unknown> = {};
            if (conceptId !== undefined) args["conceptId"] = conceptId;
            return await cmrGraphql("tool", args, "{conceptId name longName description version providerId url}");
        } catch (error) {
            return toNasaError(error, "Failed to query cmr tool");
        }
    },
});

export const nasaQueryCmrTools = tool({
    description: "Tool to query multiple tools from NASA's Common Metadata Repository using GraphQL. Use when you need to search for software applications and utilities that process or visualize Earth science data. Supports filtering by keyword, provider, and pagination.",
    inputSchema: z.object({
        nasaApiKey: z.string().optional().describe("NASA API key (injected when connected; only sent to api.nasa.gov endpoints)"),
        limit: z.number().int().min(1).max(2000).optional().describe("Maximum number of tools to return in the response. Default is determined by the API."),
        cursor: z.string().optional().describe("Cursor string that points to a specific position in the result list for pagination. Use the cursor from a previous response to get the next page."),
        offset: z.number().int().min(0).optional().describe("Zero-based offset for pagination. Skip this many results before returning items."),
        keyword: z.string().optional().describe("Keyword search value to find tools by matching against tool metadata fields."),
        provider: z.string().optional().describe("Name of the data provider associated with the tool. Example: 'POCLOUD'."),
        sortKey: z.array(z.string()).optional().describe("List of sort keys for ordering results. Prefix with '-' for descending order (default is ascending). Example: ['-name', 'conceptId']."),
        conceptId: z.array(z.string()).optional().describe("List of unique concept IDs assigned to tools. Example: ['TL2092786348-POCLOUD']. Use to retrieve specific known tools."),
    }),
    execute: async ({ nasaApiKey, limit, cursor, offset, keyword, provider, sortKey, conceptId }) => {
        try {
            const args: Record<string, unknown> = {};
            if (limit !== undefined) args["limit"] = limit;
            if (cursor !== undefined) args["cursor"] = cursor;
            if (offset !== undefined) args["offset"] = offset;
            if (keyword !== undefined) args["keyword"] = keyword;
            if (provider !== undefined) args["provider"] = provider;
            if (sortKey !== undefined) args["sortKey"] = sortKey;
            if (conceptId !== undefined) args["conceptId"] = conceptId;
            return await cmrGraphql("tools", args, "{count items{conceptId name longName version description providerId} cursor}");
        } catch (error) {
            return toNasaError(error, "Failed to query cmr tools");
        }
    },
});

export const nasaQueryCmrVariable = tool({
    description: "Tool to query a single variable from NASA's Common Metadata Repository using its unique concept ID. Use when you need to retrieve detailed metadata about a specific CMR variable including its name, long name, and definition.",
    inputSchema: z.object({
        nasaApiKey: z.string().optional().describe("NASA API key (injected when connected; only sent to api.nasa.gov endpoints)"),
        conceptId: z.string().describe("The unique concept ID assigned to the variable in CMR (e.g., 'V2112019824-POCLOUD'). This uniquely identifies a specific variable."),
    }),
    execute: async ({ nasaApiKey, conceptId }) => {
        try {
            const args: Record<string, unknown> = {};
            if (conceptId !== undefined) args["conceptId"] = conceptId;
            return await cmrGraphql("variable", args, "{conceptId name longName definition units}");
        } catch (error) {
            return toNasaError(error, "Failed to query cmr variable");
        }
    },
});

export const nasaQueryCollectionDraft = tool({
    description: "Tool to query a NASA Earthdata collection draft by ID using the GraphQL API. Returns detailed metadata including title, abstract, version, DOI, platforms, and spatial/temporal extents. Use when you need to retrieve information about a specific collection draft from NASA's Earthdata system.",
    inputSchema: z.object({
        nasaApiKey: z.string().optional().describe("NASA API key (injected when connected; only sent to api.nasa.gov endpoints)"),
        id: z.number().int().describe("The unique ID of the collection draft to query. Must be a valid draft ID from the NASA Earthdata system."),
    }),
    execute: async ({ nasaApiKey, id }) => {
        try {
            const args: Record<string, unknown> = {};
            if (id !== undefined) args["id"] = id;
            return await cmrGraphql("collectionDraft", args, "{title abstract shortName versionId doi}");
        } catch (error) {
            return toNasaError(error, "Failed to query collection draft");
        }
    },
});

export const nasaQueryDataQualitySummaries = tool({
    description: "Query data quality summaries from NASA's Common Metadata Repository (CMR) GraphQL API. Use when you need to retrieve metadata about data quality assessments for NASA datasets. Returns summary information including concept IDs, names, and HTML-formatted quality descriptions.",
    inputSchema: z.object({
        nasaApiKey: z.string().optional().describe("NASA API key (injected when connected; only sent to api.nasa.gov endpoints)"),
        limit: z.number().int().min(1).max(100).optional().describe("Maximum number of results to return per page (1-100). If not specified, API default is used."),
        cursor: z.string().optional().describe("Pagination cursor returned from a previous query. Use this to fetch the next page of results."),
    }),
    execute: async ({ nasaApiKey, limit, cursor }) => {
        try {
            const args: Record<string, unknown> = {};
            if (limit !== undefined) args["limit"] = limit;
            if (cursor !== undefined) args["cursor"] = cursor;
            return await cmrGraphql("dataQualitySummaries", args, "{count items{id name conceptId summary} cursor}");
        } catch (error) {
            return toNasaError(error, "Failed to query data quality summaries");
        }
    },
});

export const nasaQueryDataQualitySummary = tool({
    description: "Query for a single Data Quality Summary from NASA's Common Metadata Repository (CMR) using GraphQL. Use when you need to retrieve detailed quality information about a specific NASA dataset by its concept ID. Returns metadata including name, summary, and association details.",
    inputSchema: z.object({
        nasaApiKey: z.string().optional().describe("NASA API key (injected when connected; only sent to api.nasa.gov endpoints)"),
        conceptId: z.string().describe("The unique concept ID of the Data Quality Summary to retrieve. Format: 'DQS[numbers]-[provider]' (e.g., 'DQS2700451712-LANCEMODIS'). This ID uniquely identifies a specific data quality summary in the CMR system."),
    }),
    execute: async ({ nasaApiKey, conceptId }) => {
        try {
            const args: Record<string, unknown> = {};
            if (conceptId !== undefined) args["conceptId"] = conceptId;
            return await cmrGraphql("dataQualitySummary", args, "{id name conceptId summary}");
        } catch (error) {
            return toNasaError(error, "Failed to query data quality summary");
        }
    },
});

export const nasaQueryOrderOption = tool({
    description: "Tool to query a single order option from NASA Earthdata GraphQL API. Use when you need to retrieve detailed metadata about a specific order option by its concept ID.",
    inputSchema: z.object({
        nasaApiKey: z.string().optional().describe("NASA API key (injected when connected; only sent to api.nasa.gov endpoints)"),
        conceptId: z.string().optional().describe("The unique concept ID assigned to the order option (e.g., 'OO2700524498-NSIDC_ECS'). If not provided, returns order option metadata if available."),
    }),
    execute: async ({ nasaApiKey, conceptId }) => {
        try {
            const args: Record<string, unknown> = {};
            if (conceptId !== undefined) args["conceptId"] = conceptId;
            return await cmrGraphql("orderOption", args, "{conceptId name description}");
        } catch (error) {
            return toNasaError(error, "Failed to query order option");
        }
    },
});

export const nasaQueryOrderOptions = tool({
    description: "Tool to query order options for a NASA Earthdata collection using the GraphQL API. Use when you need to retrieve available ordering options for a specific collection concept ID.",
    inputSchema: z.object({
        nasaApiKey: z.string().optional().describe("NASA API key (injected when connected; only sent to api.nasa.gov endpoints)"),
        conceptId: z.string().describe("Collection concept ID to query order options for. Must be a valid NASA Earthdata collection concept ID (e.g., 'C1234567890-DEMO')."),
    }),
    execute: async ({ nasaApiKey, conceptId }) => {
        try {
            const args: Record<string, unknown> = {};
            if (conceptId !== undefined) args["conceptId"] = conceptId;
            return await cmrGraphql("orderOptions", args, "{count items{conceptId name description providerId} cursor}");
        } catch (error) {
            return toNasaError(error, "Failed to query order options");
        }
    },
});

export const nasaQueryPermissions = tool({
    description: "Tool to query permissions from NASA's Common Metadata Repository (CMR) GraphQL API. Returns a list of permissions with concept IDs, system objects, targets, and permission strings. Use when you need to retrieve access control information for NASA Earthdata resources.",
    inputSchema: z.object({
        nasaApiKey: z.string().optional().describe("NASA API key (injected when connected; only sent to api.nasa.gov endpoints)"),
        target: z.string().optional().describe("Target identifier to filter permissions for a specific target."),
        userId: z.string().optional().describe("Specific user identifier to query permissions for a particular user."),
        provider: z.string().optional().describe("Provider identifier to filter permissions by data provider."),
        userType: z.enum(["guest", "registered"]).optional().describe("User type for permission queries."),
        conceptId: z.string().optional().describe("Single concept identifier to filter permissions for a specific resource."),
        conceptIds: z.array(z.string()).optional().describe("List of concept identifiers to filter permissions for multiple resources."),
        systemObject: z.string().optional().describe("System object identifier to filter permissions (e.g., 'INGEST_MANAGEMENT_ACL', 'GROUP', 'PROVIDER'). Use to query permissions for specific system objects."),
    }),
    execute: async ({ nasaApiKey, target, userId, provider, userType, conceptId, conceptIds, systemObject }) => {
        try {
            const args: Record<string, unknown> = {};
            if (target !== undefined) args["target"] = target;
            if (userId !== undefined) args["userId"] = userId;
            if (provider !== undefined) args["provider"] = provider;
            if (userType !== undefined) args["userType"] = userType;
            if (conceptId !== undefined) args["conceptId"] = conceptId;
            if (conceptIds !== undefined) args["conceptIds"] = conceptIds;
            if (systemObject !== undefined) args["systemObject"] = systemObject;
            return await cmrGraphql("permissions", args, "{count items{conceptId systemObject target}}");
        } catch (error) {
            return toNasaError(error, "Failed to query permissions");
        }
    },
});

export const nasaQueryProviders = tool({
    description: "Tool to query for a list of data providers from NASA's Common Metadata Repository via GraphQL. Use when you need to discover available data providers or get provider metadata. Returns all available providers with their IDs, short names, and metadata flags (cmrOnly, small, consortiums).",
    inputSchema: z.object({
        nasaApiKey: z.string().optional().describe("NASA API key (injected when connected; only sent to api.nasa.gov endpoints)"),
        limit: z.number().int().min(1).optional().describe("Maximum number of providers to include in response fields (not a filter, just limits returned fields). If not specified, all provider fields are returned."),
    }),
    execute: async ({ nasaApiKey, limit }) => {
        try {
            const args: Record<string, unknown> = {};
            if (limit !== undefined) args["limit"] = limit;
            return await cmrGraphql("providers", args, "{count items{providerId shortName cmrOnly small}}");
        } catch (error) {
            return toNasaError(error, "Failed to query providers");
        }
    },
});

export const nasaQueryTagDefinitions = tool({
    description: "Tool to query tag definitions from NASA's Common Metadata Repository (CMR) GraphQL API. Use when you need to retrieve metadata about tag definitions including concept IDs, tag keys, descriptions, and originator information. Optionally filter by tag key or originator ID.",
    inputSchema: z.object({
        nasaApiKey: z.string().optional().describe("NASA API key (injected when connected; only sent to api.nasa.gov endpoints)"),
        tagKey: z.string().optional().describe("The unique tag key to filter results. Use this to search for specific tag definitions by their key identifier."),
        originatorId: z.string().optional().describe("The ID of the user that created the tag. Use this to filter tag definitions by the user who created them."),
    }),
    execute: async ({ nasaApiKey, tagKey, originatorId }) => {
        try {
            const args: Record<string, unknown> = {};
            if (tagKey !== undefined) args["tagKey"] = tagKey;
            if (originatorId !== undefined) args["originatorId"] = originatorId;
            return await cmrGraphql("tagDefinitions", args, "{items{tagKey conceptId revisionId description originatorId}}");
        } catch (error) {
            return toNasaError(error, "Failed to query tag definitions");
        }
    },
});

export const nasaQueryToolDraft = tool({
    description: "Tool to query a tool draft from NASA's Common Metadata Repository (CMR) GraphQL API. Use when you need to retrieve information about a specific tool draft by its ID.",
    inputSchema: z.object({
        nasaApiKey: z.string().optional().describe("NASA API key (injected when connected; only sent to api.nasa.gov endpoints)"),
        id: z.number().int().describe("The unique identifier of the tool draft to retrieve."),
    }),
    execute: async ({ nasaApiKey, id }) => {
        try {
            const args: Record<string, unknown> = {};
            if (id !== undefined) args["id"] = id;
            return await cmrGraphql("toolDraft", args, "{name description version}");
        } catch (error) {
            return toNasaError(error, "Failed to query tool draft");
        }
    },
});

export const nasaQueryVisualization = tool({
    description: "Tool to query a single visualization from NASA's Common Metadata Repository using its unique concept ID. Use when you need to retrieve detailed metadata about a specific NASA visualization including name, title, description, type, and related information.",
    inputSchema: z.object({
        nasaApiKey: z.string().optional().describe("NASA API key (injected when connected; only sent to api.nasa.gov endpoints)"),
        conceptId: z.string().describe("The unique concept ID assigned to the visualization. Example: 'VIS3727370138-ESDIS'. This uniquely identifies a specific visualization in NASA's CMR."),
    }),
    execute: async ({ nasaApiKey, conceptId }) => {
        try {
            const args: Record<string, unknown> = {};
            if (conceptId !== undefined) args["conceptId"] = conceptId;
            return await cmrGraphql("visualization", args, "{conceptId name title description}");
        } catch (error) {
            return toNasaError(error, "Failed to query visualization");
        }
    },
});

export const nasaQueryVisualizations = tool({
    description: "Tool to query for visualizations from NASA's Common Metadata Repository via GraphQL. Use when searching for graphical representations of Earth Science data like maps, charts, or animations.",
    inputSchema: z.object({
        nasaApiKey: z.string().optional().describe("NASA API key (injected when connected; only sent to api.nasa.gov endpoints)"),
        name: z.string().optional().describe("Filter by visualization name"),
        limit: z.number().int().min(1).max(2000).optional().describe("Maximum number of visualizations to return (1-2000). Default: 5."),
        title: z.string().optional().describe("Filter by visualization title"),
        cursor: z.string().optional().describe("Cursor for pagination. Use the cursor from previous response to get next page of results."),
        offset: z.number().int().min(0).optional().describe("Zero-based offset for pagination. Use with limit for paging through results."),
        keyword: z.string().optional().describe("Free-text keyword search against visualization metadata (title, description, etc.)"),
        provider: z.string().optional().describe("Data provider identifier to filter results"),
        sortKey: z.array(z.string()).optional().describe("Field(s) to sort results by. Prepend '-' for descending order."),
        nativeId: z.string().optional().describe("Native identifier assigned by the data provider"),
        conceptId: z.string().optional().describe("The unique concept ID assigned to a specific visualization. Use for exact lookups."),
        visualizationType: z.string().optional().describe("Type of visualization to filter by"),
    }),
    execute: async ({ nasaApiKey, name, limit, title, cursor, offset, keyword, provider, sortKey, nativeId, conceptId, visualizationType }) => {
        try {
            const args: Record<string, unknown> = {};
            if (name !== undefined) args["name"] = name;
            if (limit !== undefined) args["limit"] = limit;
            if (title !== undefined) args["title"] = title;
            if (cursor !== undefined) args["cursor"] = cursor;
            if (offset !== undefined) args["offset"] = offset;
            if (keyword !== undefined) args["keyword"] = keyword;
            if (provider !== undefined) args["provider"] = provider;
            if (sortKey !== undefined) args["sortKey"] = sortKey;
            if (nativeId !== undefined) args["nativeId"] = nativeId;
            if (conceptId !== undefined) args["conceptId"] = conceptId;
            if (visualizationType !== undefined) args["visualizationType"] = visualizationType;
            return await cmrGraphql("visualizations", args, "{count items{conceptId name title description providerId} cursor}");
        } catch (error) {
            return toNasaError(error, "Failed to query visualizations");
        }
    },
});

export const nasaDeleteAssociation = tool({
    description: "Tool to delete an existing association between concepts in NASA's Common Metadata Repository. Use when you need to remove relationships between collections, services, tools, or other CMR resources. Requires appropriate permissions to delete associations.",
    inputSchema: z.object({
        nasaApiKey: z.string().optional().describe("NASA API key (injected when connected; only sent to api.nasa.gov endpoints)"),
        conceptId: z.string().describe("The unique concept ID of the primary resource from which associations should be deleted. Example: 'C1234567890-PROV'. This is the source concept in the association."),
        associatedConceptId: z.string().optional().describe("The concept ID of a single associated resource to delete. Use this parameter to delete one association. Mutually exclusive with associated_concept_ids."),
        associatedConceptIds: z.array(z.string()).optional().describe("List of associated concept IDs to delete. Use this parameter to delete multiple associations at once. Mutually exclusive with associated_concept_id."),
    }),
    execute: async ({ nasaApiKey, conceptId, associatedConceptId, associatedConceptIds }) => {
        try {
            const args: Record<string, unknown> = {};
            if (conceptId !== undefined) args["conceptId"] = conceptId;
            if (associatedConceptId !== undefined) args["associatedConceptId"] = associatedConceptId;
            if (associatedConceptIds !== undefined) args["associatedConceptIds"] = associatedConceptIds;
            return await cmrGraphqlMutation("deleteAssociation", args, "{conceptId revisionId associatedConceptId}");
        } catch (error) {
            return toNasaError(error, "Failed to delete association");
        }
    },
});

export const nasaDeleteCmrAcl = tool({
    description: "Tool to delete an Access Control List (ACL) from NASA's Common Metadata Repository. Use when you need to remove access controls for a specific CMR resource. Requires appropriate permissions to delete ACLs.",
    inputSchema: z.object({
        nasaApiKey: z.string().optional().describe("NASA API key (injected when connected; only sent to api.nasa.gov endpoints)"),
        conceptId: z.string().describe("The unique concept ID of the ACL to delete. Example: 'ACL1200000000-TEST'. This uniquely identifies a specific ACL in NASA's CMR."),
    }),
    execute: async ({ nasaApiKey, conceptId }) => {
        try {
            const args: Record<string, unknown> = {};
            if (conceptId !== undefined) args["conceptId"] = conceptId;
            return await cmrGraphqlMutation("deleteAcl", args, "{conceptId revisionId}");
        } catch (error) {
            return toNasaError(error, "Failed to delete cmr acl");
        }
    },
});

export const nasaRestoreCitationRevision = tool({
    description: "Tool to restore a previous version of a citation record within NASA's Common Metadata Repository. Use when you need to revert a citation to an earlier revision by specifying both the concept ID and the target revision number.",
    inputSchema: z.object({
        nasaApiKey: z.string().optional().describe("NASA API key (injected when connected; only sent to api.nasa.gov endpoints)"),
        conceptId: z.string().describe("The unique concept ID assigned to the citation (e.g., 'CIT3857576156-ESDIS'). This identifies the citation record to restore."),
        revisionId: z.string().describe("The revision ID of the citation to restore. This specifies which previous version of the citation should be restored."),
    }),
    execute: async ({ nasaApiKey, conceptId, revisionId }) => {
        try {
            const args: Record<string, unknown> = {};
            if (conceptId !== undefined) args["conceptId"] = conceptId;
            if (revisionId !== undefined) args["revisionId"] = revisionId;
            return await cmrGraphqlMutation("restoreCitationRevision", args, "{conceptId revisionId}");
        } catch (error) {
            return toNasaError(error, "Failed to restore citation revision");
        }
    },
});

export const nasaRestoreCollectionRevision = tool({
    description: "Tool to restore a collection to a previous revision in NASA's Common Metadata Repository. Use when you need to revert a collection back to a specific historical version. Requires appropriate permissions to modify collections.",
    inputSchema: z.object({
        nasaApiKey: z.string().optional().describe("NASA API key (injected when connected; only sent to api.nasa.gov endpoints)"),
        conceptId: z.string().describe("The unique concept ID assigned to the collection. Example: 'C2789815280-ENVIDAT'. This uniquely identifies the collection to restore."),
        revisionId: z.string().describe("The revision ID to restore the collection to. Example: '11'. This specifies which historical version of the collection to restore."),
    }),
    execute: async ({ nasaApiKey, conceptId, revisionId }) => {
        try {
            const args: Record<string, unknown> = {};
            if (conceptId !== undefined) args["conceptId"] = conceptId;
            if (revisionId !== undefined) args["revisionId"] = revisionId;
            return await cmrGraphqlMutation("restoreCollectionRevision", args, "{conceptId revisionId}");
        } catch (error) {
            return toNasaError(error, "Failed to restore collection revision");
        }
    },
});

export const nasaRestoreVisualizationRevision = tool({
    description: "Tool to restore a previous revision of a visualization in NASA's Common Metadata Repository. Use when you need to revert a visualization to a specific historical revision. Requires appropriate permissions to modify visualizations.",
    inputSchema: z.object({
        nasaApiKey: z.string().optional().describe("NASA API key (injected when connected; only sent to api.nasa.gov endpoints)"),
        conceptId: z.string().describe("The unique concept ID assigned to the visualization. Example: 'VIS3727370138-ESDIS'. This uniquely identifies a specific visualization in NASA's CMR."),
        revisionId: z.string().describe("The revision ID of the visualization to restore. Example: '1'. This specifies which historical revision to restore."),
    }),
    execute: async ({ nasaApiKey, conceptId, revisionId }) => {
        try {
            const args: Record<string, unknown> = {};
            if (conceptId !== undefined) args["conceptId"] = conceptId;
            if (revisionId !== undefined) args["revisionId"] = revisionId;
            return await cmrGraphqlMutation("restoreVisualizationRevision", args, "{conceptId revisionId}");
        } catch (error) {
            return toNasaError(error, "Failed to restore visualization revision");
        }
    },
});
