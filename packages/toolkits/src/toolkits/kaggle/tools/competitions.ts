// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { kaggle } from './client.js';

const tokenField = z.string().optional().describe('Injected by system; do not provide');

export const kaggleCompetitionDownloadFiles = tool({
    description: "Downloads all data files for a Kaggle competition as a single zip archive. Returns a downloadable file object. Note: You must have accepted the competition's rules on Kaggle's website before downloading (403 error if not accepted).",
    inputSchema: z.object({
        kaggleCredentials: tokenField,
        id: z.string().describe("Competition URL slug (identifier). Find this in the competition's URL: kaggle.com/competitions/{slug}"),
        path: z.string().optional().describe("Deprecated. Local download paths are no longer returned."),
        force: z.boolean().optional().describe("Deprecated. Local file caching is no longer used."),
        quiet: z.boolean().optional().describe("Reserved for future use. Currently has no effect on download behavior."),
    }),
    execute: async ({ kaggleCredentials, id, path, force, quiet }) => {
        const queryParams = undefined;
        return kaggle(kaggleCredentials, { path: `/competitions/${encodeURIComponent(id)}/files/download`, method: 'GET', query: queryParams });
    },
});

export const kaggleCompetitionSubmit = tool({
    description: "Submit an entry to a Kaggle competition using a previously uploaded file. Prerequisites: 1. You must have accepted the competition rules on Kaggle's website 2. You must have uploaded your submission file and obtained a blob_file_tokens (use Kaggle's file upload API endpoint first) This action performs the final submission step after file upload. The blob token identifies your uploaded file and associates it with your competition submission.",
    inputSchema: z.object({
        kaggleCredentials: tokenField,
        competition: z.string().describe("Competition slug (URL name) from the competition URL. For example, use 'titanic' for kaggle.com/c/titanic. You must have accepted the competition rules before submitting."),
        blobFileTokens: z.string().describe("File upload token obtained from Kaggle's blob upload API. This token is returned when you upload your submission file using the Kaggle API's upload endpoint (typically /competitions/submissions/upload). The token identifies the location of your uploaded submission file on Kaggle's servers."),
        submissionDescription: z.string().describe("Brief description or message for this submission (e.g., what changes you made, model version, etc.). This helps you track different submissions."),
    }),
    execute: async ({ kaggleCredentials, competition, blobFileTokens, submissionDescription }) => {
        const form = { blobFileTokens, submissionDescription };
        return kaggle(kaggleCredentials, { path: `/competitions/submissions/submit/${encodeURIComponent(competition)}`, method: 'POST', form });
    },
});

export const kaggleDownloadCompetitionFile = tool({
    description: "Tool to download a specific data file from a Kaggle competition. Use when you need to retrieve a single file from a competition by specifying the competition slug and filename. Note: You must have accepted the competition's rules on Kaggle's website before downloading.",
    inputSchema: z.object({
        kaggleCredentials: tokenField,
        id: z.string().describe("Competition URL slug (identifier). Find this in the competition's URL: kaggle.com/competitions/{slug}"),
        fileName: z.string().describe("Name of the specific competition data file to download (e.g., 'train.csv', 'test.csv')."),
    }),
    execute: async ({ kaggleCredentials, id, fileName }) => {
        const queryParams = undefined;
        return kaggle(kaggleCredentials, { path: `/competitions/${encodeURIComponent(id)}/files/${encodeURIComponent(fileName)}/download`, method: 'GET', query: queryParams });
    },
});

export const kaggleDownloadCompetitionLeaderboard = tool({
    description: "Tool to download the entire competition leaderboard as a CSV file packaged in a ZIP archive. Use when you need to analyze or review competition standings and scores.",
    inputSchema: z.object({
        kaggleCredentials: tokenField,
        id: z.string().describe("Competition name or URL slug (identifier). Find this in the competition's URL: kaggle.com/competitions/{slug}"),
        path: z.string().optional().describe("Deprecated. Local download paths are no longer returned."),
        force: z.boolean().optional().describe("Deprecated. Local file caching is no longer used."),
    }),
    execute: async ({ kaggleCredentials, id, path, force }) => {
        const apiPath = `/competitions/${encodeURIComponent(id)}/leaderboard/download`;
    return kaggle(kaggleCredentials, { path: apiPath, method: 'GET' });
    },
});

export const kaggleGenerateCompetitionSubmissionUrl = tool({
    description: "Tool to generate a pre-signed URL for uploading competition submission files. Use this before uploading your submission file to Kaggle. This action generates a temporary upload URL and token for submitting to a competition. You must provide the competition ID, file size, and last modified timestamp. After obtaining the URL, upload your submission file to the createUrl, then use the token to finalize the submission.",
    inputSchema: z.object({
        kaggleCredentials: tokenField,
        id: z.string().describe("Competition name, as it appears in the competition's URL. For example, use 'titanic' for kaggle.com/c/titanic. You must have accepted the competition rules before generating submission URLs."),
        fileName: z.string().optional().describe("Competition submission file name. Typically a CSV file containing your predictions. If not provided, a default name may be assigned."),
        contentLength: z.number().int().describe("Content length of the submission file in bytes. This is the size of the file you plan to upload."),
        lastModifiedDateUtc: z.number().int().describe("Last modified date of the submission file in seconds since epoch (Unix timestamp) in UTC. Use the file's last modified timestamp."),
    }),
    execute: async ({ kaggleCredentials, id, fileName, contentLength, lastModifiedDateUtc }) => {
        const form = fileName !== undefined ? { fileName } : {};
        return kaggle(kaggleCredentials, { path: `/competitions/${encodeURIComponent(id)}/submissions/url/${encodeURIComponent(contentLength)}/${encodeURIComponent(lastModifiedDateUtc)}`, method: 'POST', form });
    },
});

export const kaggleListCompetitionFiles = tool({
    description: "Tool to list all data files available for a Kaggle competition. Use when you need to retrieve file names, sizes, and metadata for competition datasets before downloading.",
    inputSchema: z.object({
        kaggleCredentials: tokenField,
        id: z.string().describe("Competition name or URL slug (identifier). Find this in the competition's URL: kaggle.com/competitions/{slug}"),
    }),
    execute: async ({ kaggleCredentials, id }) => {
        const queryParams = undefined;
        return kaggle(kaggleCredentials, { path: `/competitions/${encodeURIComponent(id)}/files`, method: 'GET', query: queryParams });
    },
});

export const kaggleListCompetitions = tool({
    description: "Tool to list available Kaggle competitions with filters and pagination. Use when you need to discover competitions, search by keywords, or filter by category, group, and sorting options.",
    inputSchema: z.object({
        kaggleCredentials: tokenField,
        page: z.number().int().optional().describe("Page number for paginated results. Each page typically returns 20 competitions. Default: 1."),
        group: z.enum(["general", "entered", "inClass"]).optional().describe("Competition group filter options."),
        search: z.string().optional().describe("Search terms to filter competitions by keywords in title or description. Default: empty (no search filter)."),
        sortBy: z.enum(["grouped", "prize", "earliestDeadline", "latestDeadline", "numberOfTeams", "recentlyCreated"]).optional().describe("Competition sorting options."),
        category: z.enum(["all", "featured", "research", "recruitment", "gettingStarted", "masters", "playground"]).optional().describe("Competition category filter options."),
    }),
    execute: async ({ kaggleCredentials, page, group, search, sortBy, category }) => {
        const queryParams = { group: group, search: search, sortBy: sortBy, category: category };
        return kaggle(kaggleCredentials, { path: `/competitions`, method: 'GET', query: queryParams });
    },
});

export const kaggleViewCompetitionLeaderboard = tool({
    description: "Tool to view competition leaderboard information showing rankings and scores of participants. Use when you need to check competition standings, team scores, or analyze leaderboard positions.",
    inputSchema: z.object({
        kaggleCredentials: tokenField,
        id: z.string().describe("Competition name or URL slug (identifier). Find this in the competition's URL: kaggle.com/competitions/{slug}"),
    }),
    execute: async ({ kaggleCredentials, id }) => {
        const queryParams = undefined;
        return kaggle(kaggleCredentials, { path: `/competitions/${encodeURIComponent(id)}/leaderboard`, method: 'GET', query: queryParams });
    },
});
