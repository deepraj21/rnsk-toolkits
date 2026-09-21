// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import fs from 'node:fs';
import pathMod from 'node:path';
import { kaggle } from './client.js';

const KERNEL_METADATA_TEMPLATE = {
    id: 'USERNAME/KERNEL-SLUG',
    title: 'Kernel Title',
    code_file: 'notebook.ipynb',
    language: 'python',
    kernel_type: 'notebook',
    is_private: true,
    enable_gpu: false,
    enable_internet: false,
    dataset_sources: [],
    competition_sources: [],
    kernel_sources: [],
    model_sources: [],
};

const tokenField = z.string().optional().describe('Injected by system; do not provide');

export const kaggleKernelInit = tool({
    description: "Initialize a kernel-metadata.json template file in a specified folder. This file is required before pushing/uploading a kernel to Kaggle. The template includes default values for kernel configuration (language, kernel_type, GPU settings, etc.) that can be customized before pushing. Use this when setting up a new Kaggle kernel locally.",
    inputSchema: z.object({
        kaggleCredentials: tokenField,
        path: z.string().optional().describe("Folder path where kernel-metadata.json will be created. Use '.' for current directory or provide an absolute/relative path."),
    }),
    execute: async ({ kaggleCredentials, path }) => {
        try {
            const dir = path ?? '.';
            fs.mkdirSync(dir, { recursive: true });
            const filePath = pathMod.join(dir, 'kernel-metadata.json');
            if (fs.existsSync(filePath)) {
                return { metadata_path: filePath, note: 'kernel-metadata.json already exists, left unchanged' };
            }
            fs.writeFileSync(filePath, JSON.stringify(KERNEL_METADATA_TEMPLATE, null, 2));
            return { metadata_path: filePath };
        } catch (error) {
            return { error: 'Error initializing kernel metadata', message: error instanceof Error ? error.message : 'Unknown error' };
        }
    },
});

export const kaggleKernelOutput = tool({
    description: "Tool to download the output of a Kaggle kernel. Use when needing the latest kernel results locally.",
    inputSchema: z.object({
        kaggleCredentials: tokenField,
        path: z.string().optional().describe("Deprecated. Local download paths are no longer returned."),
        force: z.boolean().optional().describe("Deprecated. Local file caching is no longer used."),
        userName: z.string().describe("Owner of the kernel."),
        kernelSlug: z.string().describe("Slug name of the kernel."),
    }),
    execute: async ({ kaggleCredentials, path, force, userName, kernelSlug }) => {
        const queryParams = undefined;
        return kaggle(kaggleCredentials, { path: `/kernels/${encodeURIComponent(userName)}/${encodeURIComponent(kernelSlug)}/output`, method: 'GET', query: queryParams });
    },
});

export const kaggleKernelsStatus = tool({
    description: "Get the execution status of a Kaggle kernel (notebook). Returns current status (running, complete, error), timestamps, and output URL. Use this to monitor kernel execution after pushing/submitting a kernel. Note: You need permission to access the kernel - typically only your own kernels or public kernels you have access to.",
    inputSchema: z.object({
        kaggleCredentials: tokenField,
        userName: z.string().describe("Username of the kernel owner (typically your Kaggle username for your own kernels)"),
        kernelSlug: z.string().describe("URL-friendly identifier (slug) of the kernel, typically lowercase with hyphens (e.g., 'my-analysis-notebook')"),
    }),
    execute: async ({ kaggleCredentials, userName, kernelSlug }) => {
        const queryParams = undefined;
        return kaggle(kaggleCredentials, { path: `/kernels/${encodeURIComponent(userName)}/${encodeURIComponent(kernelSlug)}/status`, method: 'GET', query: queryParams });
    },
});

export const kaggleListKernelOutputFiles = tool({
    description: "Tool to list output files for a specific kernel run. Use when you need to retrieve paginated file listings by kernel owner and slug.",
    inputSchema: z.object({
        kaggleCredentials: tokenField,
        pageSize: z.number().int().optional().describe("Number of items per page (default: 20, max: 200)."),
        userName: z.string().describe("Kernel owner username."),
        pageToken: z.string().optional().describe("Page token for results paging."),
        kernelSlug: z.string().describe("Kernel slug/name."),
    }),
    execute: async ({ kaggleCredentials, pageSize, userName, pageToken, kernelSlug }) => {
        const queryParams = { page_size: pageSize, page_token: pageToken };
        return kaggle(kaggleCredentials, { path: `/kernels/${encodeURIComponent(userName)}/${encodeURIComponent(kernelSlug)}/output/files`, method: 'GET', query: queryParams });
    },
});

export const kaggleListKernels = tool({
    description: "Tool to list Kaggle kernels (notebooks and scripts) with filters and pagination. Use to discover kernels by search terms, user, language, type, competition, or dataset.",
    inputSchema: z.object({
        kaggleCredentials: tokenField,
        page: z.number().int().optional().describe("Page number for paginated results. Default: 1."),
        user: z.string().optional().describe("Filter kernels by a specific user or organization username."),
        group: z.enum(["everyone", "profile", "upvoted"]).optional().describe("Groups for filtering kernels."),
        search: z.string().optional().describe("Search terms to filter kernels by title, code, or author."),
        sortBy: z.enum(["hotness", "commentCount", "dateCreated", "dateRun", "scoreAscending", "scoreDescending", "viewCount", "voteCount", "relevance"]).optional().describe("Sort options for kernel listings."),
        dataset: z.string().optional().describe("Filter kernels that use a specific dataset (format: owner/dataset-name)."),
        language: z.enum(["all", "python", "r", "sqlite", "julia"]).optional().describe("Programming languages supported by Kaggle kernels."),
        pageSize: z.number().int().optional().describe("Number of kernels per page. Default: 20."),
        kernelType: z.enum(["all", "script", "notebook"]).optional().describe("Types of Kaggle kernels."),
        outputType: z.enum(["all", "visualization", "data"]).optional().describe("Output types for Kaggle kernels."),
        competition: z.string().optional().describe("Filter kernels associated with a specific competition (format: competition-slug)."),
        parentKernel: z.string().optional().describe("Filter kernels that have forked the specified kernel (format: owner/kernel-name)."),
    }),
    execute: async ({ kaggleCredentials, page, user, group, search, sortBy, dataset, language, pageSize, kernelType, outputType, competition, parentKernel }) => {
        const queryParams = { pageSize: pageSize, user: user, group: group, search: search, sortBy: sortBy, dataset: dataset, kernelType: kernelType, outputType: outputType, competition: competition, parentKernel: parentKernel };
        return kaggle(kaggleCredentials, { path: `/kernels`, method: 'GET', query: queryParams });
    },
});

export const kagglePullKernel = tool({
    description: "Tool to pull (download) the source code of a Kaggle kernel to local storage. Use when you need to retrieve a kernel's notebook, script, or metadata files. Optionally include metadata JSON file with kernel configuration details.",
    inputSchema: z.object({
        kaggleCredentials: tokenField,
        path: z.string().optional().describe("Deprecated. Local download paths are no longer returned."),
        force: z.boolean().optional().describe("Deprecated. Local file caching is no longer used."),
        metadata: z.boolean().optional().describe("If true, include kernel-metadata.json file in the download. This file contains kernel configuration details like language, GPU settings, and dataset references."),
        ownerSlug: z.string().describe("Kernel owner username (e.g., 'kami1976'). This is the username of the person or organization that owns the kernel."),
        kernelSlug: z.string().describe("Kernel name/slug (e.g., 'stanford-rna-3d-enhanced-model'). This is the URL-friendly identifier for the kernel, typically lowercase with hyphens."),
    }),
    execute: async ({ kaggleCredentials, path, force, metadata, ownerSlug, kernelSlug }) => {
        const queryParams = { userName: ownerSlug, kernelSlug: kernelSlug, metadata: metadata };
        return kaggle(kaggleCredentials, { path: `/kernels/pull`, method: 'GET', query: queryParams });
    },
});
