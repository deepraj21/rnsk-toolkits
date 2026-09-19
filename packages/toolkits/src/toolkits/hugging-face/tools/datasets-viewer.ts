// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { hfApi, HOSTS } from './client.js';
import { repoIdOf as _r, uiPrefix as _u } from './client.js';

const tokenField = z.string().optional().describe('Injected by system; do not provide');

function repoIdOf(namespace, repo, repoId) { return _r(namespace, repo, repoId); }
function uiPrefix(repoType) { return _u(repoType); }

export const huggingFaceCheckDatasetValidity = tool({
    description: "Tool to check whether a specific dataset is valid on Hugging Face Hub. Use when you need to determine what features (preview, viewer, search, filter, statistics) are available for a dataset.",
    inputSchema: z.object({
        huggingFaceToken: tokenField,
        dataset: z.string().describe("Name of the dataset to check validity for. Format: 'namespace/repo-name' (e.g., 'rajpurkar/squad', 'huggingface/cifar10')."),
    }),
    execute: async ({ huggingFaceToken, dataset }) => {
        const queryParams = { dataset: dataset };
        return hfApi(huggingFaceToken, { method: 'GET', url: `${HOSTS.DS}/is-valid`, queryParams });
    },
});

export const huggingFaceFilterDatasetRows = tool({
    description: "Tool to filter rows in a Hugging Face dataset split based on SQL-like query conditions. Use when you need to search or filter specific rows from a dataset based on column values, or to retrieve sorted subsets of data.",
    inputSchema: z.object({
        huggingFaceToken: tokenField,
        split: z.string().describe("Name of the dataset split to filter (e.g., 'train', 'test', 'validation')."),
        where: z.string().describe("SQL WHERE clause for filtering rows. Use column names and comparison operators (e.g., 'label=0', 'score>0.5', 'text LIKE \"%happy%\"'). Multiple conditions can be combined with AND/OR."),
        config: z.string().describe("Name of the dataset configuration/subset to filter. Use 'default' for datasets without explicit configs."),
        length: z.number().int().min(1).max(100).optional().describe("Maximum number of rows to return. Defaults to 100. Maximum allowed is 100."),
        offset: z.number().int().min(0).optional().describe("Number of rows to skip before returning results. Use with length for pagination."),
        dataset: z.string().describe("Full name of the dataset in the format 'namespace/dataset-name'. Example: 'cornell-movie-review-data/rotten_tomatoes'."),
        orderby: z.string().optional().describe("SQL ORDER BY clause for sorting results. Specify column name and optionally 'ASC' or 'DESC' (e.g., 'score DESC', 'date ASC')."),
    }),
    execute: async ({ huggingFaceToken, split, where, config, length, offset, dataset, orderby }) => {
        const queryParams = { dataset: dataset, config: config, split: split, where: where, orderby: orderby, offset: offset, length: length };
        return hfApi(huggingFaceToken, { method: 'GET', url: `${HOSTS.DS}/filter`, queryParams });
    },
});

export const huggingFaceGetDatasetCroissant = tool({
    description: "Tool to get Croissant metadata about a Hugging Face dataset. Croissant is a metadata format built on schema.org aimed at describing datasets used for machine learning. Use when you need structured metadata in JSON-LD format.",
    inputSchema: z.object({
        huggingFaceToken: tokenField,
        dataset: z.string().describe("Full dataset name in format 'namespace/repo' (e.g., 'ibm-research/duorc', 'squad', 'huggingface/transformers')."),
    }),
    execute: async ({ huggingFaceToken, dataset }) => {
        const queryParams = undefined;
        return hfApi(huggingFaceToken, { method: 'GET', url: `${HOSTS.HUB}/api/datasets/${encodeURIComponent(dataset)}/croissant`, queryParams });
    },
});

export const huggingFaceGetDatasetFirstRows = tool({
    description: "Tool to get the first 100 rows of a dataset split along with column data types and features. Use when you need to preview or sample dataset content.",
    inputSchema: z.object({
        huggingFaceToken: tokenField,
        split: z.string().describe("Name of the dataset split to retrieve rows from."),
        config: z.string().describe("Name of the dataset configuration/subset. Use 'default' for datasets without configurations."),
        dataset: z.string().describe("Name of the dataset in format 'namespace/name'. For example, 'cornell-movie-review-data/rotten_tomatoes' or 'squad'."),
    }),
    execute: async ({ huggingFaceToken, split, config, dataset }) => {
        const queryParams = { dataset: dataset, config: config, split: split };
        return hfApi(huggingFaceToken, { method: 'GET', url: `${HOSTS.DS}/first-rows`, queryParams });
    },
});

export const huggingFaceGetDatasetInfo = tool({
    description: "Tool to get general information about a dataset including description, citation, homepage, license, and features (column schemas). Use when you need to understand dataset structure, available splits, and metadata before working with the data.",
    inputSchema: z.object({
        huggingFaceToken: tokenField,
        config: z.string().optional().describe("Name of the config/subset to retrieve information for. If not provided, returns info for the default configuration."),
        dataset: z.string().describe("Name of the dataset to retrieve information for. Format: 'namespace/repo-name' (e.g., 'rajpurkar/squad', 'ibm/duorc')."),
    }),
    execute: async ({ huggingFaceToken, config, dataset }) => {
        const queryParams = { dataset: dataset, config: config };
        return hfApi(huggingFaceToken, { method: 'GET', url: `${HOSTS.DS}/info`, queryParams });
    },
});

export const huggingFaceGetDatasetRows = tool({
    description: "Tool to retrieve a slice of rows from a Hugging Face dataset split at any given location (offset). Returns up to 100 rows at a time with complete feature type information and no truncation. Use when you need to inspect specific rows from a dataset without downloading the entire dataset.",
    inputSchema: z.object({
        huggingFaceToken: tokenField,
        split: z.string().describe("Name of the dataset split to retrieve rows from. Common splits include 'train', 'test', and 'validation'."),
        config: z.string().describe("Name of the config/subset of the dataset. Each dataset may have multiple configurations for different variations or subsets."),
        length: z.number().int().min(1).max(100).describe("Number of rows to retrieve. Maximum allowed value is 100. Use smaller values for faster responses."),
        offset: z.number().int().min(0).describe("Starting row index (0-based) from which to begin retrieving rows. Use 0 to start from the beginning of the dataset."),
        dataset: z.string().describe("Name of the dataset to retrieve rows from. Use format 'namespace/dataset_name' (e.g., 'stanfordnlp/imdb', 'ibm/duorc')."),
    }),
    execute: async ({ huggingFaceToken, split, config, length, offset, dataset }) => {
        const queryParams = { dataset: dataset, config: config, split: split, offset: offset, length: length };
        return hfApi(huggingFaceToken, { method: 'GET', url: `${HOSTS.DS}/rows`, queryParams });
    },
});

export const huggingFaceGetDatasetSize = tool({
    description: "Tool to get the size of a Hugging Face dataset including number of rows and size in bytes. Use when you need to determine dataset size, memory requirements, or storage needs for a specific dataset.",
    inputSchema: z.object({
        huggingFaceToken: tokenField,
        dataset: z.string().describe("Name of the dataset to get size information for. Format: 'namespace/repo-name' (e.g., 'stanfordnlp/imdb', 'ibm/duorc')."),
    }),
    execute: async ({ huggingFaceToken, dataset }) => {
        const queryParams = { dataset: dataset };
        return hfApi(huggingFaceToken, { method: 'GET', url: `${HOSTS.DS}/size`, queryParams });
    },
});

export const huggingFaceGetDatasetStatistics = tool({
    description: "Tool to get comprehensive statistics about a dataset split including column statistics and data distribution information. Use when you need to analyze dataset composition, understand data distributions, or get statistical summaries of dataset features.",
    inputSchema: z.object({
        huggingFaceToken: tokenField,
        split: z.string().describe("Name of the split to get statistics for (e.g., 'train', 'test', 'validation')."),
        config: z.string().describe("Name of the configuration/subset of the dataset (e.g., 'mnist', 'cola', 'default')."),
        dataset: z.string().describe("Name of the dataset. Format: 'namespace/dataset-name' (e.g., 'ylecun/mnist', 'nyu-mll/glue')."),
    }),
    execute: async ({ huggingFaceToken, split, config, dataset }) => {
        const queryParams = { dataset: dataset, config: config, split: split };
        return hfApi(huggingFaceToken, { method: 'GET', url: `${HOSTS.DS}/statistics`, queryParams });
    },
});

export const huggingFaceListDatasetParquetFiles = tool({
    description: "Tool to get the list of Parquet files for a dataset. Use when you need to download or access dataset files in Parquet format. Returns URLs to download Parquet files with metadata about splits, configurations, and file sizes.",
    inputSchema: z.object({
        huggingFaceToken: tokenField,
        dataset: z.string().describe("Name of the dataset to get Parquet files for. Format: 'namespace/repo-name' (e.g., 'rajpurkar/squad', 'huggingface/cifar10')."),
    }),
    execute: async ({ huggingFaceToken, dataset }) => {
        const queryParams = { dataset: dataset };
        return hfApi(huggingFaceToken, { method: 'GET', url: `${HOSTS.DS}/parquet`, queryParams });
    },
});

export const huggingFaceListDatasetSplits = tool({
    description: "Tool to get the list of subsets and splits of a dataset. Returns the available configurations and splits for a given dataset on the Hub. Use when you need to understand the structure of a dataset before querying specific splits.",
    inputSchema: z.object({
        huggingFaceToken: tokenField,
        dataset: z.string().describe("Name of the dataset to retrieve splits for. Format: 'namespace/repo-name' (e.g., 'stanfordnlp/imdb', 'huggingface/squad')."),
    }),
    execute: async ({ huggingFaceToken, dataset }) => {
        const queryParams = { dataset: dataset };
        return hfApi(huggingFaceToken, { method: 'GET', url: `${HOSTS.DS}/splits`, queryParams });
    },
});

export const huggingFaceSearchDataset = tool({
    description: "Tool to search text in a dataset split on Hugging Face. Searches in columns of type string, even if values are nested in a dictionary. Use when you need to find specific text or patterns within a dataset's content. Returns matching rows with their data.",
    inputSchema: z.object({
        huggingFaceToken: tokenField,
        query: z.string().describe("Text to search for in the dataset. Searches in all columns of type string, even if values are nested in a dictionary."),
        split: z.string().describe("Name of the dataset split to search."),
        config: z.string().describe("Name of the configuration/subset of the dataset to search."),
        length: z.number().int().min(1).max(100).optional().describe("Length of the slice (number of rows to return). Maximum value is 100. Defaults to API default if not specified."),
        offset: z.number().int().min(0).optional().describe("Offset of the slice for pagination. Specifies the starting position in the results. Defaults to 0 if not specified."),
        dataset: z.string().describe("Name of the dataset to search. Use format 'owner/dataset-name' for user datasets or just 'dataset-name' for official datasets."),
    }),
    execute: async ({ huggingFaceToken, query, split, config, length, offset, dataset }) => {
        const queryParams = { dataset: dataset, config: config, split: split, query: query, offset: offset, length: length };
        return hfApi(huggingFaceToken, { method: 'GET', url: `${HOSTS.DS}/search`, queryParams });
    },
});
