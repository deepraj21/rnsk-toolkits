// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { nasaGet, nasaPost, nasaDownloadMeta, toNasaError, enc, cmrGraphql } from './client.js';

export const nasaGetCitation = tool({
    description: "Tool to retrieve detailed citation information from NASA Technical Reports Server (NTRS) by citation ID. Use when you need complete metadata for a specific NASA scientific or technical document, including abstract, authors, publication details, copyright information, export control status, and download links.",
    inputSchema: z.object({
        nasaApiKey: z.string().optional().describe("NASA API key (injected when connected; only sent to api.nasa.gov endpoints)"),
        id: z.number().int().describe("The unique numeric identifier for the citation record in the NASA Technical Reports Server (NTRS). Use this to retrieve detailed information about a specific scientific or technical document."),
    }),
    execute: async ({ nasaApiKey, id }) => {
        try {
return await nasaGet("https://ntrs.nasa.gov", `/api/citations/${enc(id)}`);
        } catch (error) {
            return toNasaError(error, "Failed to get citation");
        }
    },
});

export const nasaGetCitationDownloads = tool({
    description: "Tool to retrieve all available download links for a NASA technical report or publication by citation ID. Use this when you need to access PDFs, abstracts, or other documents associated with a NASA citation.",
    inputSchema: z.object({
        nasaApiKey: z.string().optional().describe("NASA API key (injected when connected; only sent to api.nasa.gov endpoints)"),
        id: z.number().int().describe("NASA citation ID to retrieve downloads for. This is the unique identifier for a NASA technical report or publication (e.g., 20180008545)."),
    }),
    execute: async ({ nasaApiKey, id }) => {
        try {
return await nasaGet("https://ntrs.nasa.gov", `/api/citations/${enc(id)}/downloads`);
        } catch (error) {
            return toNasaError(error, "Failed to get citation downloads");
        }
    },
});

export const nasaDownloadCitationDocument = tool({
    description: "Downloads a document file from a NASA NTRS (NASA Technical Reports Server) citation. Use this when you need to retrieve PDF or other document files associated with a specific citation ID. Supports partial content downloads via byte range specification.",
    inputSchema: z.object({
        nasaApiKey: z.string().optional().describe("NASA API key (injected when connected; only sent to api.nasa.gov endpoints)"),
        id: z.number().int().describe("Citation ID number for the NASA NTRS document to download. This is the unique identifier for the citation entry."),
        range: z.string().describe("HTTP Range header value specifying byte range to download. Use 'bytes=0-' to download entire file, or specify a specific range like 'bytes=0-1024' for partial content."),
        filename: z.string().describe("Name of the file to download (e.g., '20040121077.pdf'). This should match the actual filename associated with the citation."),
        attachment: z.boolean().optional().describe("If true, the response will include Content-Disposition header to prompt download as attachment. If false, file may display inline in browser."),
    }),
    execute: async ({ nasaApiKey, id, filename, range, attachment }) => {
        try {
            const headers: Record<string, string> = {};
            if (range !== undefined) headers.Range = range;
            return await nasaDownloadMeta("https://ntrs.nasa.gov", `/api/citations/${enc(id)}/downloads/${enc(filename)}`, headers);
        } catch (error) {
            return toNasaError(error, "Failed to download citation document");
        }
    },
});

export const nasaGetCitationRevisionId = tool({
    description: "Tool to retrieve citation revision IDs from NASA Common Metadata Repository (CMR) GraphQL API. Use when you need to track version/revision numbers of citation records in the CMR system. Returns citation metadata including revisionId field which tracks the revision history.",
    inputSchema: z.object({
        nasaApiKey: z.string().optional().describe("NASA API key (injected when connected; only sent to api.nasa.gov endpoints)"),
        limit: z.number().int().min(1).max(100).optional().describe("Maximum number of citations to return (1-100). Defaults to 20."),
        conceptId: z.string().optional().describe("Filter citations by concept ID (e.g., 'CIT3857576156-ESDIS'). If not provided, returns all citations."),
        providerId: z.string().optional().describe("Filter citations by provider ID (e.g., 'ESDIS')."),
    }),
    execute: async ({ nasaApiKey, limit, conceptId, providerId }) => {
        try {
            const args: Record<string, unknown> = {};
            if (limit !== undefined) args["limit"] = limit;
            if (conceptId !== undefined) args["conceptId"] = conceptId;
            if (providerId !== undefined) args["providerId"] = providerId;
            return await cmrGraphql("citations", args, "{count items{conceptId name revisionId revisionDate providerId} cursor}");
        } catch (error) {
            return toNasaError(error, "Failed to get citation revision id");
        }
    },
});

export const nasaGetCitationsAutocomplete = tool({
    description: "Tool to get autocomplete suggestions from NASA NTRS (Technical Reports Server) citations. Use when you need to search for partial matches in citation fields like author names, titles, subjects, or abstracts to help users complete their searches.",
    inputSchema: z.object({
        nasaApiKey: z.string().optional().describe("NASA API key (injected when connected; only sent to api.nasa.gov endpoints)"),
        q: z.string().describe("Query string to search for autocomplete matches. Partial text that will be matched against values in the specified field (e.g., 'smith' for author field)."),
        field: z.string().describe("Field to search for autocomplete suggestions (e.g., 'author', 'title', 'subject', 'abstract'). Specifies which citation field to query for matching values."),
    }),
    execute: async ({ nasaApiKey, field, q }) => {
        try {
            const query: Record<string, unknown> = {};
            if (field !== undefined) query["field"] = field;
            if (q !== undefined) query["q"] = q;
return await nasaGet("https://ntrs.nasa.gov", `/api/citations/autocomplete`, { query });
        } catch (error) {
            return toNasaError(error, "Failed to get citations autocomplete");
        }
    },
});

export const nasaGetCitationsRedistributions = tool({
    description: "Tool to retrieve redistributed citations from NASA's Technical Reports Server (NTRS). Use when you need to access information about citations that have been redistributed, including dates and distribution details.",
    inputSchema: z.object({
        nasaApiKey: z.string().optional().describe("NASA API key (injected when connected; only sent to api.nasa.gov endpoints)"),
        page: z.object({ from: z.number().int().min(0).optional().describe("Starting index for results (zero-based)."), size: z.number().int().min(1).optional().describe("Number of results to return per page.") }).optional().describe("Pagination configuration for results."),
        redistributedDate: z.object({ to: z.string().optional().describe("End date for redistributed date range in ISO 8601 format (YYYY-MM-DD)."), from: z.string().optional().describe("Start date for redistributed date range in ISO 8601 format (YYYY-MM-DD).") }).optional().describe("Date filter for redistributed citations."),
    }),
    execute: async ({ nasaApiKey, page, redistributedDate }) => {
        try {
            const query: Record<string, unknown> = {};
            if (page !== undefined) {
                if (page.from !== undefined) query['page[from]'] = page.from;
                if (page.size !== undefined) query['page[size]'] = page.size;
            }
            if (redistributedDate !== undefined) {
                if (redistributedDate.from !== undefined) query['redistributedDate[gte]'] = redistributedDate.from;
                if (redistributedDate.to !== undefined) query['redistributedDate[lte]'] = redistributedDate.to;
            }
            return await nasaGet("https://ntrs.nasa.gov", `/api/citations/redistributions`, { query });
        } catch (error) {
            return toNasaError(error, "Failed to get citations redistributions");
        }
    },
});

export const nasaSearchCitations = tool({
    description: "Tool to search NASA Technical Reports Server (NTRS) citations database. Use when you need to find NASA scientific and technical documents, research papers, reports, or publications. Supports filtering by document type, author, center, keywords, and more. Returns detailed metadata including abstracts, authors, publication info, and download links.",
    inputSchema: z.object({
        nasaApiKey: z.string().optional().describe("NASA API key (injected when connected; only sent to api.nasa.gov endpoints)"),
        q: z.string().optional().describe("General query string for full-text search across all fields. Example: 'Mars exploration' or 'climate change'. This is the primary search parameter for finding documents."),
        page: z.object({ from: z.number().int().optional().describe("Starting position for pagination (0-indexed). Specifies the number of results to skip."), size: z.number().int().max(100).optional().describe("Number of results to return per page. Maximum value is 100.") }).optional().describe("Pagination parameters for search results."),
        sort: z.object({ field: z.string().optional().describe("Field name to sort by (e.g., 'title', 'created', 'modified')."), order: z.enum(["asc", "desc"]).optional().describe("Sort order for search results.") }).optional().describe("Sort parameters for search results."),
        index: z.string().optional().describe("Index name to search within. Specifies which NTRS index to query."),
        title: z.string().optional().describe("Search within document titles only. Example: 'Space Shuttle' to find documents with 'Space Shuttle' in the title."),
        author: z.array(z.string()).optional().describe("Filter by author names. Provide a list of author names to search for. Example: ['Smith, John', 'Doe, Jane']."),
        center: z.array(z.string()).optional().describe("Filter by NASA center. Provide a list of NASA center codes. Example: ['ARC', 'MSFC'] for Ames Research Center and Marshall Space Flight Center."),
        created: z.object({ gt: z.string().optional().describe("Greater than date. Filters for dates after this value (exclusive)."), lt: z.string().optional().describe("Less than date. Filters for dates before this value (exclusive)."), gte: z.string().optional().describe("Greater than or equal to date. Filters for dates on or after this value (inclusive)."), lte: z.string().optional().describe("Less than or equal to date. Filters for dates on or before this value (inclusive)."), format: z.string().optional().describe("Date format string. Supports Elasticsearch date format patterns. Default is 'strict_date_optional_time||epoch_millis'. Reference: https://www.elastic.co/guide/en/elasticsearch/reference/7.8/mapping-date-format.html") }).optional().describe("Date range filter for created, modified, or published fields."),
        keyword: z.array(z.string()).optional().describe("Filter by specific keywords. Provide a list of keywords that must be present in the document metadata."),
        stiType: z.enum(["STI_TYPE_NONE", "CONFERENCE_PAPER", "POSTER", "PRESENTATION", "CONFERENCE_PROCEEDINGS", "CONTRACTOR_OR_GRANTEE_REPORT", "WHITE_PAPER", "THESIS_DISSERTATION", "TECHNICAL_MEMORANDUM", "CONTRACTOR_REPORT", "SPECIAL_PUBLICATION", "CONFERENCE_PUBLICATION", "TECHNICAL_PUBLICATION", "TECHNICAL_TRANSLATION", "PREPRINT", "ACCEPTED_MANUSCRIPT", "REPRINT", "BOOK", "BOOK_CHAPTER", "VIDEO", "CONTRIBUTION_TO_LARGER_WORK", "OTHER"]).optional().describe("STI (Scientific and Technical Information) document types."),
        abstract: z.string().optional().describe("Search within document abstracts only. Example: 'propulsion systems' to find documents with this phrase in their abstract."),
        modified: z.object({ gt: z.string().optional().describe("Greater than date. Filters for dates after this value (exclusive)."), lt: z.string().optional().describe("Less than date. Filters for dates before this value (exclusive)."), gte: z.string().optional().describe("Greater than or equal to date. Filters for dates on or after this value (inclusive)."), lte: z.string().optional().describe("Less than or equal to date. Filters for dates on or before this value (inclusive)."), format: z.string().optional().describe("Date format string. Supports Elasticsearch date format patterns. Default is 'strict_date_optional_time||epoch_millis'. Reference: https://www.elastic.co/guide/en/elasticsearch/reference/7.8/mapping-date-format.html") }).optional().describe("Date range filter for created, modified, or published fields."),
        highlight: z.boolean().optional().describe("Enable search term highlighting in results. When true, matching terms in results will be highlighted."),
        published: z.object({ gt: z.string().optional().describe("Greater than date. Filters for dates after this value (exclusive)."), lt: z.string().optional().describe("Less than date. Filters for dates before this value (exclusive)."), gte: z.string().optional().describe("Greater than or equal to date. Filters for dates on or after this value (inclusive)."), lte: z.string().optional().describe("Less than or equal to date. Filters for dates on or before this value (inclusive)."), format: z.string().optional().describe("Date format string. Supports Elasticsearch date format patterns. Default is 'strict_date_optional_time||epoch_millis'. Reference: https://www.elastic.co/guide/en/elasticsearch/reference/7.8/mapping-date-format.html") }).optional().describe("Date range filter for created, modified, or published fields."),
        disseminated: z.enum(["NONE", "METADATA_ONLY", "DOCUMENT_AND_METADATA"]).optional().describe("Dissemination status of the document."),
        distribution: z.enum(["PUBLIC", "US_PERSONS", "US_GOVERNMENT_AGENCIES_AND_GOVERNMENT_AGENCY_CONTRACTORS", "US_GOVERNMENT_AGENCIES", "US_GOVERNMENT_AGENCIES_AND_NASA_CONTRACTORS", "NASA_CIVIL_SERVANTS_AND_NASA_CONTRACTORS", "NASA_CIVIL_SERVANTS", "OFFICE_ONLY", "DO_NOT_DISTRIBUTE"]).optional().describe("Distribution restriction levels."),
        organization: z.array(z.string()).optional().describe("Filter by organization names. Provide a list of organization names associated with the documents."),
        reportNumber: z.array(z.string()).optional().describe("Filter by report numbers. Provide a list of specific NASA report numbers. Example: ['NASA-TM-2020-220576']."),
        fundingNumber: z.array(z.string()).optional().describe("Filter by funding/grant numbers. Provide a list of funding identifiers."),
        stiTypeDetails: z.string().optional().describe("Additional details about the STI document type for more specific filtering."),
        accessionNumber: z.array(z.string()).optional().describe("Filter by accession numbers. Provide a list of NTRS accession numbers for specific documents."),
        subjectCategory: z.array(z.string()).optional().describe("Filter by NASA subject categories. Provide a list of subject category codes or names."),
    }),
    execute: async ({ nasaApiKey, q, page, sort, index, title, author, center, created, keyword, stiType, abstract, modified, highlight, published, disseminated, distribution, organization, reportNumber, fundingNumber, stiTypeDetails, accessionNumber, subjectCategory }) => {
        try {
            const body: Record<string, unknown> = {};
            if (q !== undefined) body["q"] = q;
            if (page !== undefined) body["page"] = page;
            if (sort !== undefined) body["sort"] = sort;
            if (index !== undefined) body["index"] = index;
            if (title !== undefined) body["title"] = title;
            if (author !== undefined) body["author"] = author;
            if (center !== undefined) body["center"] = center;
            if (created !== undefined) body["created"] = created;
            if (keyword !== undefined) body["keyword"] = keyword;
            if (stiType !== undefined) body["stiType"] = stiType;
            if (abstract !== undefined) body["abstract"] = abstract;
            if (modified !== undefined) body["modified"] = modified;
            if (highlight !== undefined) body["highlight"] = highlight;
            if (published !== undefined) body["published"] = published;
            if (disseminated !== undefined) body["disseminated"] = disseminated;
            if (distribution !== undefined) body["distribution"] = distribution;
            if (organization !== undefined) body["organization"] = organization;
            if (reportNumber !== undefined) body["reportNumber"] = reportNumber;
            if (fundingNumber !== undefined) body["fundingNumber"] = fundingNumber;
            if (stiTypeDetails !== undefined) body["stiTypeDetails"] = stiTypeDetails;
            if (accessionNumber !== undefined) body["accessionNumber"] = accessionNumber;
            if (subjectCategory !== undefined) body["subjectCategory"] = subjectCategory;
            return await nasaPost("https://ntrs.nasa.gov", `/api/citations/search`, body);
        } catch (error) {
            return toNasaError(error, "Failed to search citations");
        }
    },
});

export const nasaSearchPubspaceDocuments = tool({
    description: "Search NASA public space technical documents in the NTRS (NASA Technical Reports Server) repository. Use when you need to find NASA publications, technical reports, conference papers, or other scientific documents. Supports full-text search, field-specific queries, filtering by author/center/type, date ranges, and pagination. Returns comprehensive document metadata including titles, abstracts, authors, download links, and classifications.",
    inputSchema: z.object({
        nasaApiKey: z.string().optional().describe("NASA API key (injected when connected; only sent to api.nasa.gov endpoints)"),
        q: z.string().optional().describe("Full-text search query across all document fields. Example: 'mars rover exploration'. Use quotes for exact phrases."),
        page: z.object({ from: z.number().int().min(0).optional().describe("Starting index for pagination (0-based offset). Example: 0 for first page, 20 for second page with size=20."), size: z.number().int().min(1).max(100).optional().describe("Number of results per page (1-100). Defaults to 20 if not specified.") }).optional().describe("Pagination options for search results."),
        sort: z.object({ field: z.string().optional().describe("Field name to sort by (e.g., 'title', 'created', 'published', 'modified'). Common fields: 'title', 'created', 'relevance'."), order: z.enum(["asc", "desc"]).optional().describe("Sort order enumeration.") }).optional().describe("Sorting options for search results."),
        index: z.string().optional().describe("Index name to search within. Typically 'citations' or 'pubspace'."),
        title: z.string().optional().describe("Search within document titles only. Example: 'Apollo Mission Report'."),
        author: z.array(z.string()).optional().describe("Filter by author names. Multiple authors are combined with OR logic. Example: ['Smith, John', 'Doe, Jane']."),
        center: z.array(z.string()).optional().describe("Filter by NASA center(s). Example: ['NASA Ames Research Center', 'NASA Johnson Space Center']."),
        created: z.object({ gt: z.string().optional().describe("Greater than date (exclusive) in YYYY-MM-DD format."), lt: z.string().optional().describe("Less than date (exclusive) in YYYY-MM-DD format."), gte: z.string().optional().describe("Greater than or equal to date (inclusive) in YYYY-MM-DD format."), lte: z.string().optional().describe("Less than or equal to date (inclusive) in YYYY-MM-DD format."), format: z.string().optional().describe("Elasticsearch date format. Defaults to 'strict_date_optional_time||epoch_millis' if not specified.") }).optional().describe("Date range filter with Elasticsearch-compatible format for created, published, or modified dates."),
        keyword: z.array(z.string()).optional().describe("Filter by keywords/tags. Multiple keywords are combined with OR logic. Example: ['propulsion', 'combustion']."),
        stiType: z.enum(["STI_TYPE_NONE", "CONFERENCE_PAPER", "POSTER", "PRESENTATION", "CONFERENCE_PROCEEDINGS", "CONTRACTOR_OR_GRANTEE_REPORT", "WHITE_PAPER", "THESIS_DISSERTATION", "TECHNICAL_MEMORANDUM", "CONTRACTOR_REPORT", "SPECIAL_PUBLICATION", "CONFERENCE_PUBLICATION", "TECHNICAL_PUBLICATION", "TECHNICAL_TRANSLATION", "PREPRINT", "ACCEPTED_MANUSCRIPT", "REPRINT", "BOOK", "BOOK_CHAPTER", "VIDEO", "CONTRIBUTION_TO_LARGER_WORK", "OTHER"]).optional().describe("Publication type enumeration for NASA STI documents."),
        abstract: z.string().optional().describe("Search within document abstracts only. Example: 'lunar surface analysis'."),
        modified: z.object({ gt: z.string().optional().describe("Greater than date (exclusive) in YYYY-MM-DD format."), lt: z.string().optional().describe("Less than date (exclusive) in YYYY-MM-DD format."), gte: z.string().optional().describe("Greater than or equal to date (inclusive) in YYYY-MM-DD format."), lte: z.string().optional().describe("Less than or equal to date (inclusive) in YYYY-MM-DD format."), format: z.string().optional().describe("Elasticsearch date format. Defaults to 'strict_date_optional_time||epoch_millis' if not specified.") }).optional().describe("Date range filter with Elasticsearch-compatible format for created, published, or modified dates."),
        highlight: z.boolean().optional().describe("Enable search term highlighting in results. When true, matching terms are marked in returned text."),
        published: z.object({ gt: z.string().optional().describe("Greater than date (exclusive) in YYYY-MM-DD format."), lt: z.string().optional().describe("Less than date (exclusive) in YYYY-MM-DD format."), gte: z.string().optional().describe("Greater than or equal to date (inclusive) in YYYY-MM-DD format."), lte: z.string().optional().describe("Less than or equal to date (inclusive) in YYYY-MM-DD format."), format: z.string().optional().describe("Elasticsearch date format. Defaults to 'strict_date_optional_time||epoch_millis' if not specified.") }).optional().describe("Date range filter with Elasticsearch-compatible format for created, published, or modified dates."),
        disseminated: z.enum(["NONE", "METADATA_ONLY", "DOCUMENT_AND_METADATA"]).optional().describe("Dissemination status enumeration."),
        distribution: z.enum(["PUBLIC", "US_PERSONS", "US_GOVERNMENT_AGENCIES_AND_GOVERNMENT_AGENCY_CONTRACTORS", "US_GOVERNMENT_AGENCIES", "US_GOVERNMENT_AGENCIES_AND_NASA_CONTRACTORS", "NASA_CIVIL_SERVANTS_AND_NASA_CONTRACTORS", "NASA_CIVIL_SERVANTS", "OFFICE_ONLY", "DO_NOT_DISTRIBUTE"]).optional().describe("Distribution level enumeration."),
        organization: z.array(z.string()).optional().describe("Filter by organization(s). Example: ['Jet Propulsion Laboratory']."),
        reportNumber: z.array(z.string()).optional().describe("Filter by report number(s). Example: ['NASA-TM-2020-123456']."),
        fundingNumber: z.array(z.string()).optional().describe("Filter by funding/grant number(s). Example: ['NNX15AB12G']."),
        stiTypeDetails: z.string().optional().describe("Additional details or subcategory of STI type."),
        accessionNumber: z.array(z.string()).optional().describe("Filter by accession number(s) - unique identifiers in the repository."),
        subjectCategory: z.array(z.string()).optional().describe("Filter by subject category codes or names. Example: ['Aerospace Engineering', 'Space Sciences']."),
    }),
    execute: async ({ nasaApiKey, q, page, sort, index, title, author, center, created, keyword, stiType, abstract, modified, highlight, published, disseminated, distribution, organization, reportNumber, fundingNumber, stiTypeDetails, accessionNumber, subjectCategory }) => {
        try {
            const body: Record<string, unknown> = {};
            if (q !== undefined) body["q"] = q;
            if (page !== undefined) body["page"] = page;
            if (sort !== undefined) body["sort"] = sort;
            if (index !== undefined) body["index"] = index;
            if (title !== undefined) body["title"] = title;
            if (author !== undefined) body["author"] = author;
            if (center !== undefined) body["center"] = center;
            if (created !== undefined) body["created"] = created;
            if (keyword !== undefined) body["keyword"] = keyword;
            if (stiType !== undefined) body["stiType"] = stiType;
            if (abstract !== undefined) body["abstract"] = abstract;
            if (modified !== undefined) body["modified"] = modified;
            if (highlight !== undefined) body["highlight"] = highlight;
            if (published !== undefined) body["published"] = published;
            if (disseminated !== undefined) body["disseminated"] = disseminated;
            if (distribution !== undefined) body["distribution"] = distribution;
            if (organization !== undefined) body["organization"] = organization;
            if (reportNumber !== undefined) body["reportNumber"] = reportNumber;
            if (fundingNumber !== undefined) body["fundingNumber"] = fundingNumber;
            if (stiTypeDetails !== undefined) body["stiTypeDetails"] = stiTypeDetails;
            if (accessionNumber !== undefined) body["accessionNumber"] = accessionNumber;
            if (subjectCategory !== undefined) body["subjectCategory"] = subjectCategory;
            return await nasaPost("https://ntrs.nasa.gov", `/api/pubspace/search`, body);
        } catch (error) {
            return toNasaError(error, "Failed to search pubspace documents");
        }
    },
});
