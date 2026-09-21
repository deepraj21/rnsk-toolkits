// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { kaggle } from './client.js';

const tokenField = z.string().optional().describe('Injected by system; do not provide');

export const kaggleListModelInstanceVersionFiles = tool({
    description: "Tool to list files for a specific version of a model variation. Use when you need to retrieve files for a particular model framework instance version by owner, model, framework, variation, and version.",
    inputSchema: z.object({
        kaggleCredentials: tokenField,
        framework: z.string().describe("Framework name (e.g., pyTorch, tensorFlow)."),
        pageSize: z.number().int().optional().describe("Number of items per page (default: 20)."),
        modelSlug: z.string().describe("Model name/slug."),
        ownerSlug: z.string().describe("Model owner username."),
        pageToken: z.string().optional().describe("Page token for results paging."),
        variationSlug: z.string().describe("Variation name/slug (instance slug)."),
        versionNumber: z.number().int().describe("Version number of the model variation."),
    }),
    execute: async ({ kaggleCredentials, framework, pageSize, modelSlug, ownerSlug, pageToken, variationSlug, versionNumber }) => {
        const queryParams = { pageSize: pageSize, pageToken: pageToken };
        return kaggle(kaggleCredentials, { path: `/models/${encodeURIComponent(ownerSlug)}/${encodeURIComponent(modelSlug)}/${encodeURIComponent(framework)}/${encodeURIComponent(variationSlug)}/${encodeURIComponent(versionNumber)}/files`, method: 'GET', query: queryParams });
    },
});
