// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { kaggle } from './client.js';

const tokenField = z.string().optional().describe('Injected by system; do not provide');

export const kaggleGetModel = tool({
    description: "Tool to get a Kaggle model's details including metadata and description. Use when you need information about a specific model on Kaggle.",
    inputSchema: z.object({
        kaggleCredentials: tokenField,
        modelSlug: z.string().describe("Model name/slug. This is the second part of the model identifier (e.g., 'bert' in 'google/bert')."),
        ownerSlug: z.string().describe("Model owner username or organization name. This is the first part of the model identifier (e.g., 'google' in 'google/bert')."),
    }),
    execute: async ({ kaggleCredentials, modelSlug, ownerSlug }) => {
        const queryParams = undefined;
        return kaggle(kaggleCredentials, { path: `/models/${encodeURIComponent(ownerSlug)}/${encodeURIComponent(modelSlug)}`, method: 'GET', query: queryParams });
    },
});

export const kaggleListModels = tool({
    description: "Tool to list Kaggle models with optional filters for owner, sorting, search, and pagination. Use to discover available models on Kaggle's platform.",
    inputSchema: z.object({
        kaggleCredentials: tokenField,
        owner: z.string().optional().describe("Filter to display models by a specific user or organization. Use the owner's username or organization slug."),
        search: z.string().optional().describe("Search terms to filter models by title, owner, or other text fields. Leave empty to return all models."),
        sortBy: z.enum(["hotness", "downloadCount", "voteCount", "notebookCount", "publishTime", "createTime", "updateTime"]).optional().describe("Enum for valid model list sort options."),
        pageSize: z.number().int().optional().describe("Number of models to return per page. Default: 20. Maximum: 100."),
        pageToken: z.string().optional().describe("Page token for pagination. Use the 'nextPageToken' from a previous response to fetch the next page of results. Omit for the first page."),
    }),
    execute: async ({ kaggleCredentials, owner, search, sortBy, pageSize, pageToken }) => {
        const queryParams = { owner: owner, search: search, sortBy: sortBy, pageSize: pageSize, pageToken: pageToken };
        return kaggle(kaggleCredentials, { path: `/models/list`, method: 'GET', query: queryParams });
    },
});
