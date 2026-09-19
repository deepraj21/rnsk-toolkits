// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { gitlabRequest, encodeId } from './client.js';

const tokenField = z.string().optional().describe('Injected by system; do not provide');
const projectField = z
    .union([z.string(), z.number()])
    .describe('Project ID or URL-encoded path (e.g. 123 or "group/project")');

export const gitlabListBranches = tool({
    description:
        'List branches of a GitLab project repository. Use when the user asks to see branches or find a branch name.',
    inputSchema: z.object({
        gitlabToken: tokenField,
        projectId: projectField,
        search: z.string().optional().describe('Search branches by name'),
        perPage: z.number().min(1).max(100).optional().default(20).describe('Results per page (max 100)'),
        page: z.number().min(1).optional().default(1).describe('Page number'),
    }),
    execute: async ({ gitlabToken, projectId, search, perPage = 20, page = 1 }) => {
        return gitlabRequest(gitlabToken, `/projects/${encodeId(projectId)}/repository/branches`, {
            query: { search, per_page: perPage, page },
        });
    },
});

export const gitlabListCommits = tool({
    description:
        'List commits of a GitLab project repository. Use when the user asks to see commit history or recent changes.',
    inputSchema: z.object({
        gitlabToken: tokenField,
        projectId: projectField,
        refName: z.string().optional().describe('Branch, tag, or commit SHA to list commits from (defaults to the default branch)'),
        perPage: z.number().min(1).max(100).optional().default(20).describe('Results per page (max 100)'),
        page: z.number().min(1).optional().default(1).describe('Page number'),
    }),
    execute: async ({ gitlabToken, projectId, refName, perPage = 20, page = 1 }) => {
        return gitlabRequest(gitlabToken, `/projects/${encodeId(projectId)}/repository/commits`, {
            query: { ref_name: refName, per_page: perPage, page },
        });
    },
});

export const gitlabGetFile = tool({
    description:
        'Get the content of a file from a GitLab project repository. The file path is URL-encoded automatically. Use when the user asks to read a file from a project.',
    inputSchema: z.object({
        gitlabToken: tokenField,
        projectId: projectField,
        filePath: z.string().describe('Path of the file in the repository, e.g. "README.md" or "src/index.ts"'),
        ref: z.string().optional().default('main').describe('Branch, tag, or commit SHA (defaults to "main")'),
    }),
    execute: async ({ gitlabToken, projectId, filePath, ref = 'main' }) => {
        return gitlabRequest(gitlabToken, `/projects/${encodeId(projectId)}/repository/files/${encodeId(filePath)}`, {
            query: { ref },
        });
    },
});
