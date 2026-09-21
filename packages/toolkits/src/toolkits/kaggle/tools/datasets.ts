// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import fs from 'node:fs';
import pathMod from 'node:path';
import { kaggle } from './client.js';

const tokenField = z.string().optional().describe('Injected by system; do not provide');

const DATASET_METADATA_TEMPLATE = {
    title: 'Dataset Title',
    id: 'USERNAME/DATASET-SLUG',
    licenses: [{ name: 'CC0-1.0' }],
};

export const kaggleDatasetCreate = tool({
    description: "Create a new Kaggle dataset with metadata. IMPORTANT: Dataset creation requires at least one data file. Ensure files are uploaded before calling this action. The 'id' field must use your authenticated Kaggle username as the owner. Returns the creation status and any message from the Kaggle API.",
    inputSchema: z.object({
        kaggleCredentials: tokenField,
        id: z.string().describe("Dataset identifier in the form '<owner>/<dataset-slug>'. The owner must be your authenticated Kaggle username (or an organization you belong to). The dataset-slug must be lowercase, 3-50 characters, using only letters, numbers, and hyphens."),
        files: z.array(z.record(z.any())).optional().describe("List of files already uploaded via a separate Kaggle file upload API call. Each entry references a previously uploaded file by name. NOTE: At least one file (via 'files' or physical upload) is typically required for successful dataset creation."),
        title: z.string().describe("Dataset title shown on Kaggle."),
        keywords: z.array(z.string()).optional().describe("Tags to improve discovery."),
        licenses: z.array(z.record(z.any())).describe("Provide exactly one license entry."),
        subtitle: z.string().optional().describe("Brief subtitle for the dataset card."),
        resources: z.array(z.record(z.any())).optional().describe("List of resource entries describing the dataset files and their metadata. Not required, but useful for providing file descriptions and schemas."),
        description: z.string().optional().describe("Full Markdown-formatted description."),
    }),
    execute: async ({ kaggleCredentials, id, files, title, keywords, licenses, subtitle, description }) => {
        const [ownerSlug, ...slugParts] = id.split('/');
        const datasetSlug = slugParts.join('/');
        const body = { title, slug: datasetSlug, owner_slug: ownerSlug, license_name: licenses?.[0]?.name, subtitle, description, files, category_ids: keywords };
        return kaggle(kaggleCredentials, { path: '/datasets/create/new', method: 'POST', body });
    },
});

export const kaggleDatasetInit = tool({
    description: "Tool to initialize a dataset-metadata.json file in a local folder. Use when preparing a dataset folder before uploading to Kaggle.",
    inputSchema: z.object({
        kaggleCredentials: tokenField,
        path: z.string().optional().describe("Folder path to initialize dataset-metadata.json; defaults to current working directory."),
    }),
    execute: async ({ kaggleCredentials, path }) => {
        try {
            const dir = path ?? '.';
            fs.mkdirSync(dir, { recursive: true });
            const filePath = pathMod.join(dir, 'dataset-metadata.json');
            if (fs.existsSync(filePath)) {
                return { metadata_path: filePath, note: 'dataset-metadata.json already exists, left unchanged' };
            }
            fs.writeFileSync(filePath, JSON.stringify(DATASET_METADATA_TEMPLATE, null, 2));
            return { metadata_path: filePath };
        } catch (error) {
            return { error: 'Error initializing dataset metadata', message: error instanceof Error ? error.message : 'Unknown error' };
        }
    },
});

export const kaggleDatasetListFiles = tool({
    description: "Tool to list files in a Kaggle dataset. Use when you need to retrieve paginated file listings by owner and dataset slugs, with optional version and paging controls.",
    inputSchema: z.object({
        kaggleCredentials: tokenField,
        pageSize: z.number().int().optional().describe("Number of items per page (default 20)."),
        ownerSlug: z.string().describe("Owner of the dataset (username or organization)."),
        pageToken: z.string().optional().describe("Token for pagination of results."),
        datasetSlug: z.string().describe("Slug (name) of the dataset."),
        datasetVersionNumber: z.string().optional().describe("Specific dataset version number, e.g., '1'."),
    }),
    execute: async ({ kaggleCredentials, pageSize, ownerSlug, pageToken, datasetSlug, datasetVersionNumber }) => {
        const queryParams = { datasetVersionNumber: datasetVersionNumber };
        return kaggle(kaggleCredentials, { path: `/datasets/list/${encodeURIComponent(ownerSlug)}/${encodeURIComponent(datasetSlug)}`, method: 'GET', query: queryParams });
    },
});

export const kaggleDatasetStatus = tool({
    description: "Check the processing status of a Kaggle dataset after creation or version update. This endpoint is used to monitor datasets that are currently being processed by Kaggle's servers. It returns status information for datasets that are actively uploading, processing, or experiencing errors. For already-published datasets, this endpoint typically returns 404 (Not Found), which is expected behavior. Use this tool immediately after creating a new dataset (KAGGLE_DATASET_CREATE) or updating an existing dataset version (KAGGLE_DATASET_VERSION) to check when the dataset becomes ready. Poll this endpoint periodically until the status indicates completion or error.",
    inputSchema: z.object({
        kaggleCredentials: tokenField,
        ownerSlug: z.string().describe("Owner username or organization name of the dataset. This is the first part of the dataset identifier (e.g., 'username' in 'username/dataset-name')."),
        datasetSlug: z.string().describe("URL-friendly slug (identifier) of the dataset. This is the second part of the dataset identifier (e.g., 'dataset-name' in 'username/dataset-name')."),
    }),
    execute: async ({ kaggleCredentials, ownerSlug, datasetSlug }) => {
        const queryParams = undefined;
        return kaggle(kaggleCredentials, { path: `/datasets/${encodeURIComponent(ownerSlug)}/${encodeURIComponent(datasetSlug)}/status`, method: 'GET', query: queryParams });
    },
});

export const kaggleDatasetVersion = tool({
    description: "Create a new version of an existing Kaggle dataset. Prerequisites: - You must own the dataset or have edit permissions - Files must be uploaded first to obtain upload tokens (required for the 'files' parameter) Use this when you have updated files or metadata and need to publish a new version of an existing dataset.",
    inputSchema: z.object({
        kaggleCredentials: tokenField,
        files: z.array(z.record(z.any())).describe("List of files to include in this version. Each file must reference an upload token obtained from a prior file upload to Kaggle's storage. At least one file is required."),
        subtitle: z.string().optional().describe("Optional new subtitle for the dataset"),
        ownerSlug: z.string().describe("Username or organization slug that owns the dataset. You must have edit permissions for this dataset."),
        description: z.string().optional().describe("Optional new description for the dataset"),
        categoryIds: z.array(z.string()).optional().describe("Optional list of category IDs to tag the dataset with"),
        datasetSlug: z.string().describe("URL-friendly slug identifier of the dataset to create a new version for"),
        versionNotes: z.string().describe("Notes describing changes in the new dataset version"),
        convertToCsv: z.boolean().optional().describe("Whether to convert tabular data to CSV"),
        deleteOldVersions: z.boolean().optional().describe("Whether to delete all previous versions when creating this new one"),
    }),
    execute: async ({ kaggleCredentials, files, subtitle, ownerSlug, description, categoryIds, datasetSlug, versionNotes, convertToCsv, deleteOldVersions }) => {
        const body = { version_notes: versionNotes, files, subtitle, category_ids: categoryIds, description, convert_to_csv: convertToCsv, delete_old_versions: deleteOldVersions };
        return kaggle(kaggleCredentials, { path: `/datasets/create/version/${encodeURIComponent(ownerSlug)}/${encodeURIComponent(datasetSlug)}`, method: 'POST', body });
    },
});

export const kaggleDownloadDataset = tool({
    description: "Tool to download all files from a Kaggle dataset as a zip archive. Supports downloading specific versions by providing the dataset_version_number parameter.",
    inputSchema: z.object({
        kaggleCredentials: tokenField,
        ownerSlug: z.string().describe("Owner of the dataset (username or organization)."),
        datasetSlug: z.string().describe("Slug (name) of the dataset."),
        datasetVersionNumber: z.string().optional().describe("Specific dataset version number to download. If not specified, downloads the latest version."),
    }),
    execute: async ({ kaggleCredentials, ownerSlug, datasetSlug, datasetVersionNumber }) => {
        const queryParams = { datasetVersionNumber: datasetVersionNumber };
        return kaggle(kaggleCredentials, { path: `/datasets/${encodeURIComponent(ownerSlug)}/${encodeURIComponent(datasetSlug)}/download`, method: 'GET', query: queryParams });
    },
});

export const kaggleDownloadDatasetFile = tool({
    description: "Tool to download a specific file from a Kaggle dataset. Use when you need to retrieve a single file from a dataset by specifying the owner, dataset, and filename.",
    inputSchema: z.object({
        kaggleCredentials: tokenField,
        fileName: z.string().describe("Name of the file to download from the dataset."),
        ownerSlug: z.string().describe("Dataset owner username or organization name."),
        datasetSlug: z.string().describe("Dataset slug (name identifier)."),
        datasetVersionNumber: z.string().optional().describe("Specific dataset version number to download. If not specified, downloads from the latest version."),
    }),
    execute: async ({ kaggleCredentials, fileName, ownerSlug, datasetSlug, datasetVersionNumber }) => {
        const queryParams = { datasetVersionNumber: datasetVersionNumber };
        return kaggle(kaggleCredentials, { path: `/datasets/${encodeURIComponent(ownerSlug)}/${encodeURIComponent(datasetSlug)}/files/${encodeURIComponent(fileName)}/download`, method: 'GET', query: queryParams });
    },
});

export const kaggleGetDatasetMetadata = tool({
    description: "Tool to get comprehensive metadata for a Kaggle dataset including title, description, licenses, and tags. Use when you need detailed information about a dataset's structure, schema, or properties.",
    inputSchema: z.object({
        kaggleCredentials: tokenField,
        ownerSlug: z.string().describe("Owner username or organization name of the dataset. This is the first part of the dataset identifier (e.g., 'uciml' in 'uciml/iris')."),
        datasetSlug: z.string().describe("URL-friendly slug (identifier) of the dataset. This is the second part of the dataset identifier (e.g., 'iris' in 'uciml/iris')."),
    }),
    execute: async ({ kaggleCredentials, ownerSlug, datasetSlug }) => {
        const queryParams = undefined;
        return kaggle(kaggleCredentials, { path: `/datasets/${encodeURIComponent(ownerSlug)}/${encodeURIComponent(datasetSlug)}/metadata`, method: 'GET', query: queryParams });
    },
});

export const kaggleListDatasets = tool({
    description: "Tool to list Kaggle datasets with filters and pagination. Use after authenticating with Kaggle API key.",
    inputSchema: z.object({
        kaggleCredentials: tokenField,
        page: z.number().int().optional().describe("Page number for paginated results. Default: 1. Increment by 1 on each subsequent call to paginate; stop when a call returns no data."),
        size: z.string().optional().describe("DEPRECATED: use max_size and min_size instead. Legacy size filter. Default behavior: all."),
        user: z.string().optional().describe("Filter datasets by a specific user or organization."),
        group: z.string().optional().describe("Display datasets by a particular group. Valid values: 'public' (all public datasets), 'mine' (user's own datasets), 'user' (datasets by specific user when combined with 'user' parameter). Default: public."),
        search: z.string().optional().describe("Search terms to filter datasets. Default: empty."),
        tagids: z.string().optional().describe("Comma-separated list of tag IDs to filter by."),
        license: z.string().optional().describe("Filter datasets by license group. Valid values: 'all', 'cc', 'gpl', 'odb', 'other'. Default: all."),
        sortBy: z.string().optional().describe("Sort the results. Valid values: 'hottest', 'votes', 'updated', 'active'. Default: hottest."),
        filetype: z.string().optional().describe("Filter datasets by file type. Valid values: 'all', 'csv', 'sqlite', 'json', 'bigQuery'. Default: all."),
        maxSize: z.number().int().optional().describe("Maximum dataset size in bytes."),
        minSize: z.number().int().optional().describe("Minimum dataset size in bytes."),
    }),
    execute: async ({ kaggleCredentials, page, size, user, group, search, tagids, license, sortBy, filetype, maxSize, minSize }) => {
        const queryParams = { page: page, size: size, user: user, group: group, search: search, tagids: tagids, license: license, sortBy: sortBy, filetype: filetype, maxSize: maxSize, minSize: minSize };
        return kaggle(kaggleCredentials, { path: `/datasets/list`, method: 'GET', query: queryParams });
    },
});
