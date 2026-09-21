// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { nasaGet, toNasaError, enc } from './client.js';

export const nasaGetOsdrBiospecimen = tool({
    description: "Tool to retrieve detailed information about a specific biospecimen from NASA's Open Science Data Repository (OSDR). Returns comprehensive metadata including specimen type, anatomical section, preservation method, storage conditions, experimental group, protocol details, and parent subject references. Use when you need information about a specific biological specimen from space biology research studies.",
    inputSchema: z.object({
        nasaApiKey: z.string().optional().describe("NASA API key (injected when connected; only sent to api.nasa.gov endpoints)"),
        identifier: z.string().describe("Biospecimen identifier (numeric ID). This identifies a specific biological specimen in the Open Science Data Repository."),
    }),
    execute: async ({ nasaApiKey, identifier }) => {
        try {
return await nasaGet("https://osdr.nasa.gov", `/geode-py/ws/api/biospecimen/${enc(identifier)}`);
        } catch (error) {
            return toNasaError(error, "Failed to get osdr biospecimen");
        }
    },
});

export const nasaListOsdrBiospecimens = tool({
    description: "Tool to retrieve a list of all biospecimens from the NASA Open Science Data Repository (OSDR). Use when you need to discover available biospecimen data from space biology experiments. Returns URLs that can be used to fetch detailed information for each biospecimen.",
    inputSchema: z.object({
        nasaApiKey: z.string().optional().describe("NASA API key (injected when connected; only sent to api.nasa.gov endpoints)"),
    }),
    execute: async ({ nasaApiKey }) => {
        try {
return await nasaGet("https://osdr.nasa.gov", `/geode-py/ws/api/biospecimens`);
        } catch (error) {
            return toNasaError(error, "Failed to list osdr biospecimens");
        }
    },
});

export const nasaGetOsdrExperiment = tool({
    description: "Retrieve detailed information about a specific OSDR (Open Science Data Repository) experiment by its identifier. Returns comprehensive metadata including title, objectives, approach, results, sponsoring agency, research areas, NASA programs, publications, and related studies. Use this when you need detailed scientific information about a specific NASA OSDR experiment.",
    inputSchema: z.object({
        nasaApiKey: z.string().optional().describe("NASA API key (injected when connected; only sent to api.nasa.gov endpoints)"),
        identifier: z.string().describe("Experiment identifier (e.g., 'OS-140'). This is the unique OSDR experiment ID."),
    }),
    execute: async ({ nasaApiKey, identifier }) => {
        try {
return await nasaGet("https://osdr.nasa.gov", `/geode-py/ws/api/experiment/${enc(identifier)}`);
        } catch (error) {
            return toNasaError(error, "Failed to get osdr experiment");
        }
    },
});

export const nasaListOsdrExperiments = tool({
    description: "Tool to retrieve a list of all experiments from NASA's Open Science Data Repository (OSDR). Returns a catalog of experiment URLs that can be used to fetch detailed information about individual experiments. Use when you need to discover available space biology experiments or get a complete inventory of OSDR experiments.",
    inputSchema: z.object({
        nasaApiKey: z.string().optional().describe("NASA API key (injected when connected; only sent to api.nasa.gov endpoints)"),
    }),
    execute: async ({ nasaApiKey }) => {
        try {
return await nasaGet("https://osdr.nasa.gov", `/geode-py/ws/api/experiments`);
        } catch (error) {
            return toNasaError(error, "Failed to list osdr experiments");
        }
    },
});

export const nasaGetOsdrHardware = tool({
    description: "Retrieve detailed information about specific hardware from NASA's Open Science Data Repository (OSDR). Returns comprehensive hardware details including components, version history, and parent relationships. Use when you need technical specifications, subsystem information, or configuration details for space flight hardware used in OSDR experiments.",
    inputSchema: z.object({
        nasaApiKey: z.string().optional().describe("NASA API key (injected when connected; only sent to api.nasa.gov endpoints)"),
        identifier: z.string().describe("Hardware identifier (numeric string, e.g., '133'). This uniquely identifies the hardware item in the OSDR system."),
    }),
    execute: async ({ nasaApiKey, identifier }) => {
        try {
return await nasaGet("https://osdr.nasa.gov", `/geode-py/ws/api/hardware/${enc(identifier)}`);
        } catch (error) {
            return toNasaError(error, "Failed to get osdr hardware");
        }
    },
});

export const nasaListOsdrHardware = tool({
    description: "Tool to retrieve a list of all hardware from NASA's Open Science Data Repository (OSDR). Returns a catalog of hardware URLs that can be used to fetch detailed information about individual hardware items. Use when you need to discover available space flight hardware or get a complete inventory of OSDR hardware.",
    inputSchema: z.object({
        nasaApiKey: z.string().optional().describe("NASA API key (injected when connected; only sent to api.nasa.gov endpoints)"),
    }),
    execute: async ({ nasaApiKey }) => {
        try {
return await nasaGet("https://osdr.nasa.gov", `/geode-py/ws/api/hardware`);
        } catch (error) {
            return toNasaError(error, "Failed to list osdr hardware");
        }
    },
});

export const nasaGetOsdrMetadata = tool({
    description: "Retrieve complete metadata for an OSDR (Open Science Data Repository) study dataset. Returns experimental design, assays, sample characteristics, ontology references, and publication information for NASA space biology research. Use when you need comprehensive metadata about a specific OSD study including organism details, experimental conditions, assay types, and data files.",
    inputSchema: z.object({
        nasaApiKey: z.string().optional().describe("NASA API key (injected when connected; only sent to api.nasa.gov endpoints)"),
        studyId: z.string().describe("OSD study identifier. Can be provided as a number (e.g., '137') or with 'OSD-' prefix (e.g., 'OSD-137'). This identifies the specific Open Science Data Repository study dataset."),
    }),
    execute: async ({ nasaApiKey, studyId }) => {
        try {
            const numeric = String(studyId).replace(/^OSD-/i, '');
            if (!/^\d+$/.test(numeric)) return { error: 'Study ID must be numeric (e.g. 137 or OSD-137)' };
            return await nasaGet("https://osdr.nasa.gov", `/osdr/data/osd/meta/${numeric}`);
        } catch (error) {
            return toNasaError(error, "Failed to get osdr metadata");
        }
    },
});

export const nasaGetOsdrMission = tool({
    description: "Retrieve detailed information about a specific space mission from NASA's Open Science Data Repository (OSDR). Returns mission metadata including start/end dates, personnel, vehicle information, and links to related payloads, experiments, and studies. Use this when you need comprehensive information about a specific NASA space mission.",
    inputSchema: z.object({
        nasaApiKey: z.string().optional().describe("NASA API key (injected when connected; only sent to api.nasa.gov endpoints)"),
        identifier: z.string().describe("Mission identifier (e.g., 'SpaceX-12', 'Increment 52/53'). This is the unique identifier for the space mission."),
    }),
    execute: async ({ nasaApiKey, identifier }) => {
        try {
return await nasaGet("https://osdr.nasa.gov", `/geode-py/ws/api/mission/${enc(identifier)}`);
        } catch (error) {
            return toNasaError(error, "Failed to get osdr mission");
        }
    },
});

export const nasaListOsdrMissions = tool({
    description: "Tool to retrieve a list of all space missions from the NASA Open Science Data Repository (OSDR). Use when you need to discover available mission data from space biology and physical science experiments. Returns URLs that can be used to fetch detailed information for each mission including dates, vehicles, personnel, and related studies.",
    inputSchema: z.object({
        nasaApiKey: z.string().optional().describe("NASA API key (injected when connected; only sent to api.nasa.gov endpoints)"),
    }),
    execute: async ({ nasaApiKey }) => {
        try {
return await nasaGet("https://osdr.nasa.gov", `/geode-py/ws/api/missions`);
        } catch (error) {
            return toNasaError(error, "Failed to list osdr missions");
        }
    },
});

export const nasaGetOsdrPayload = tool({
    description: "Retrieve detailed metadata for a specific OSDR payload by its identifier. Returns comprehensive information including payload name, description, associated missions, subject groups, personnel, experiments, and version information. Use this when you need to access detailed information about NASA OSDR payloads and their associated space biology experiments.",
    inputSchema: z.object({
        nasaApiKey: z.string().optional().describe("NASA API key (injected when connected; only sent to api.nasa.gov endpoints)"),
        identifier: z.string().describe("Payload identifier (e.g., 'RR-9', 'RR-1'). This is the unique code assigned to each OSDR payload."),
    }),
    execute: async ({ nasaApiKey, identifier }) => {
        try {
return await nasaGet("https://osdr.nasa.gov", `/geode-py/ws/api/payload/${enc(identifier)}`);
        } catch (error) {
            return toNasaError(error, "Failed to get osdr payload");
        }
    },
});

export const nasaListOsdrPayloads = tool({
    description: "Tool to retrieve a list of all payloads from the NASA Open Science Data Repository (OSDR). Use when you need to discover available payload data from space biology and physical science experiments. Returns URLs that can be used to fetch detailed information for each payload including related missions, vehicles, and experiments.",
    inputSchema: z.object({
        nasaApiKey: z.string().optional().describe("NASA API key (injected when connected; only sent to api.nasa.gov endpoints)"),
    }),
    execute: async ({ nasaApiKey }) => {
        try {
return await nasaGet("https://osdr.nasa.gov", `/geode-py/ws/api/payloads`);
        } catch (error) {
            return toNasaError(error, "Failed to list osdr payloads");
        }
    },
});

export const nasaGetOsdrSubject = tool({
    description: "Retrieve detailed information about a specific subject (biospecimen) from NASA's Open Science Data Repository (OSDR). Returns metadata including scientific name, common name, description, experimental conditions, and references to related payloads and experiments. Use this when you need information about biological samples used in space life sciences research.",
    inputSchema: z.object({
        nasaApiKey: z.string().optional().describe("NASA API key (injected when connected; only sent to api.nasa.gov endpoints)"),
        identifier: z.string().describe("Unique identifier for the subject (biospecimen) to retrieve. This can be a numeric ID (e.g., '1') or alphanumeric identifier."),
    }),
    execute: async ({ nasaApiKey, identifier }) => {
        try {
return await nasaGet("https://osdr.nasa.gov", `/geode-py/ws/api/subject/${enc(identifier)}`);
        } catch (error) {
            return toNasaError(error, "Failed to get osdr subject");
        }
    },
});

export const nasaListOsdrSubjects = tool({
    description: "Tool to retrieve a list of all subjects from the NASA Open Science Data Repository (OSDR). Use when you need to discover available subject data from space biology experiments. Returns URLs that can be used to fetch detailed information for each subject.",
    inputSchema: z.object({
        nasaApiKey: z.string().optional().describe("NASA API key (injected when connected; only sent to api.nasa.gov endpoints)"),
    }),
    execute: async ({ nasaApiKey }) => {
        try {
return await nasaGet("https://osdr.nasa.gov", `/geode-py/ws/api/subjects`);
        } catch (error) {
            return toNasaError(error, "Failed to list osdr subjects");
        }
    },
});

export const nasaGetOsdrVehicle = tool({
    description: "Retrieve detailed information about a specific vehicle from NASA's Open Science Data Repository (OSDR). Returns vehicle metadata including associated files, missions, and version information. Use this when you need to access information about spacecraft vehicles like Dragon, Cygnus, or Progress that have been used in NASA missions.",
    inputSchema: z.object({
        nasaApiKey: z.string().optional().describe("NASA API key (injected when connected; only sent to api.nasa.gov endpoints)"),
        identifier: z.string().describe("Vehicle identifier (e.g., 'Dragon', 'Cygnus', 'Progress'). This is the name of the vehicle to retrieve details for."),
    }),
    execute: async ({ nasaApiKey, identifier }) => {
        try {
return await nasaGet("https://osdr.nasa.gov", `/geode-py/ws/api/vehicle/${enc(identifier)}`);
        } catch (error) {
            return toNasaError(error, "Failed to get osdr vehicle");
        }
    },
});

export const nasaListOsdrVehicles = tool({
    description: "Tool to retrieve a list of all vehicles from the NASA Open Science Data Repository (OSDR). Returns vehicle names and URLs to their detailed information endpoints. Use when you need to discover available spacecraft, rockets, or other vehicles used in NASA missions.",
    inputSchema: z.object({
        nasaApiKey: z.string().optional().describe("NASA API key (injected when connected; only sent to api.nasa.gov endpoints)"),
    }),
    execute: async ({ nasaApiKey }) => {
        try {
return await nasaGet("https://osdr.nasa.gov", `/geode-py/ws/api/vehicles`);
        } catch (error) {
            return toNasaError(error, "Failed to list osdr vehicles");
        }
    },
});

export const nasaGetGldsFiles = tool({
    description: "Retrieves file metadata from NASA's GeneLab Data System (GLDS) for specified dataset IDs. Returns file listings with download URLs, sizes, categories, and metadata for space biology datasets. Use this when you need to access GeneLab study files or list available data files for OSD datasets. Supports pagination and filtering of hidden files.",
    inputSchema: z.object({
        nasaApiKey: z.string().optional().describe("NASA API key (injected when connected; only sent to api.nasa.gov endpoints)"),
        page: z.number().int().min(1).optional().describe("Page number for paginated results. Starts from 1 (not 0). Defaults to 1 if not specified."),
        size: z.number().int().min(1).max(25).optional().describe("Number of results per page. Maximum 25. Defaults to 25 if not specified."),
        allFiles: z.boolean().optional().describe("Whether to include hidden/invisible files in results. Set to true to include all files, false (default) to exclude hidden files."),
        datasetIds: z.string().describe("Comma-separated list of OSD accession numbers and/or ranges. Examples: '87' for single dataset, '137,87-95' for multiple datasets or ranges. Do not include 'OSD-' prefix."),
    }),
    execute: async ({ nasaApiKey, datasetIds, page, size, allFiles }) => {
        try {
            const query: Record<string, unknown> = {};
            if (page !== undefined) query["page"] = page;
            if (size !== undefined) query["size"] = size;
            if (allFiles !== undefined) query["all_files"] = allFiles;
return await nasaGet("https://osdr.nasa.gov", `/osdr/data/osd/files/${enc(datasetIds)}`, { query });
        } catch (error) {
            return toNasaError(error, "Failed to get glds files");
        }
    },
});

export const nasaSearchOsdr = tool({
    description: "Tool to search NASA Open Science Data Repository (OSDR) for space biology experiments and studies. Use when searching for GeneLab datasets, space biology research, microgravity experiments, or federated biological databases. Supports keyword search, filtering by organism/program/technology, and pagination. Returns detailed study metadata including descriptions, protocols, publications, and mission information.",
    inputSchema: z.object({
        nasaApiKey: z.string().optional().describe("NASA API key (injected when connected; only sent to api.nasa.gov endpoints)"),
        from: z.number().int().min(0).optional().describe("Pagination start position (0-indexed). Specifies the number of results to skip. Default is 0."),
        size: z.number().int().min(1).max(100).optional().describe("Number of results to return per page. Default is 25. Maximum value is 100."),
        sort: z.string().optional().describe("Field name to sort results by (e.g., 'Accession', 'Study Title', 'organism'). Must be a valid field in the study metadata."),
        term: z.string().optional().describe("Search keywords with optional boolean operators (AND, OR, NOT). Use to find studies by keywords in title, description, organism, or other fields. Example: 'space biology' or 'microgravity AND plants'."),
        type: z.enum(["cgene", "nih_geo_gse", "ebi_pride", "mg_rast"]).optional().describe("OSDR database types available for searching."),
        order: z.enum(["ASC", "DESC"]).optional().describe("Sort order for search results."),
        ffield: z.string().optional().describe("Filter field name (case-sensitive). Name of the metadata field to filter on (e.g., 'organism', 'Space Program', 'Study Assay Technology Type'). Must be used with 'fvalue'."),
        fvalue: z.string().optional().describe("Filter field value. Value to match for the field specified in 'ffield'. Example: if ffield='organism', fvalue='Arabidopsis thaliana'."),
    }),
    execute: async ({ nasaApiKey, from, size, sort, term, type, order, ffield, fvalue }) => {
        try {
            const query: Record<string, unknown> = {};
            if (term !== undefined) query["term"] = term;
            if (from !== undefined) query["from"] = from;
            if (size !== undefined) query["size"] = size;
            if (sort !== undefined) query["sort"] = sort;
            if (order !== undefined) query["order"] = order;
            if (type !== undefined) query["type"] = type;
            if (ffield !== undefined) query["ffield"] = ffield;
            if (fvalue !== undefined) query["fvalue"] = fvalue;
return await nasaGet("https://osdr.nasa.gov", `/osdr/data/search`, { query });
        } catch (error) {
            return toNasaError(error, "Failed to search osdr");
        }
    },
});
