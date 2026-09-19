// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { gitlabRequest, encodeId } from './client.js';

const tokenField = z.string().optional().describe('Injected by system; do not provide');
const projectField = z
    .union([z.string(), z.number()])
    .describe('Project ID or URL-encoded path (e.g. 123 or "group/project")');
const mrIidField = z.union([z.string(), z.number()]).describe('Internal ID (iid) of the merge request within the project');

export const gitlabListMergeRequests = tool({
    description:
        'List GitLab merge requests. Provide projectId to list MRs for a project, or omit it to list MRs across all visible projects. Use when the user asks to see merge requests or pull requests.',
    inputSchema: z.object({
        gitlabToken: tokenField,
        projectId: projectField.optional(),
        state: z.enum(['opened', 'closed', 'merged', 'all']).optional().describe('Filter by merge request state'),
        search: z.string().optional().describe('Search merge requests by title and description'),
        perPage: z.number().min(1).max(100).optional().default(20).describe('Results per page (max 100)'),
        page: z.number().min(1).optional().default(1).describe('Page number'),
    }),
    execute: async ({ gitlabToken, projectId, state, search, perPage = 20, page = 1 }) => {
        const path = projectId ? `/projects/${encodeId(projectId)}/merge_requests` : '/merge_requests';
        return gitlabRequest(gitlabToken, path, {
            query: { state, search, per_page: perPage, page },
        });
    },
});

export const gitlabGetMergeRequest = tool({
    description:
        'Get a single GitLab merge request by its internal ID (iid). Use when the user asks for details of a specific merge request.',
    inputSchema: z.object({
        gitlabToken: tokenField,
        projectId: projectField,
        mergeRequestIid: mrIidField,
    }),
    execute: async ({ gitlabToken, projectId, mergeRequestIid }) => {
        return gitlabRequest(gitlabToken, `/projects/${encodeId(projectId)}/merge_requests/${mergeRequestIid}`);
    },
});

export const gitlabCreateMergeRequest = tool({
    description:
        'Create a new GitLab merge request. Use when the user wants to open a merge request between two branches.',
    inputSchema: z.object({
        gitlabToken: tokenField,
        projectId: projectField,
        sourceBranch: z.string().describe('Source branch name'),
        targetBranch: z.string().describe('Target branch name'),
        title: z.string().describe('Merge request title'),
        description: z.string().optional().describe('Merge request description (Markdown supported)'),
    }),
    execute: async ({ gitlabToken, projectId, sourceBranch, targetBranch, title, description }) => {
        return gitlabRequest(gitlabToken, `/projects/${encodeId(projectId)}/merge_requests`, {
            method: 'POST',
            body: {
                source_branch: sourceBranch,
                target_branch: targetBranch,
                title,
                description,
            },
        });
    },
});

export const gitlabMergeMergeRequest = tool({
    description:
        'Accept and merge a GitLab merge request. Use only when the user explicitly asks to merge an MR.',
    inputSchema: z.object({
        gitlabToken: tokenField,
        projectId: projectField,
        mergeRequestIid: mrIidField,
        squash: z.boolean().optional().describe('Squash commits when merging'),
        shouldRemoveSourceBranch: z.boolean().optional().describe('Remove the source branch after merging'),
    }),
    execute: async ({ gitlabToken, projectId, mergeRequestIid, squash, shouldRemoveSourceBranch }) => {
        return gitlabRequest(gitlabToken, `/projects/${encodeId(projectId)}/merge_requests/${mergeRequestIid}/merge`, {
            method: 'POST',
            body: { squash, should_remove_source_branch: shouldRemoveSourceBranch },
        });
    },
});

export const gitlabCreateMergeRequestNote = tool({
    description:
        'Add a comment (note) to a GitLab merge request. Use when the user wants to comment on or review an MR.',
    inputSchema: z.object({
        gitlabToken: tokenField,
        projectId: projectField,
        mergeRequestIid: mrIidField,
        body: z.string().describe('Comment text (Markdown supported)'),
    }),
    execute: async ({ gitlabToken, projectId, mergeRequestIid, body }) => {
        return gitlabRequest(gitlabToken, `/projects/${encodeId(projectId)}/merge_requests/${mergeRequestIid}/notes`, {
            method: 'POST',
            body: { body },
        });
    },
});
