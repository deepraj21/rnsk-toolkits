// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { gitlabRequest, encodeId } from './client.js';

const tokenField = z.string().optional().describe('Injected by system; do not provide');
const projectField = z
    .union([z.string(), z.number()])
    .describe('Project ID or URL-encoded path (e.g. 123 or "group/project")');

export const gitlabListIssues = tool({
    description:
        'List GitLab issues. Provide projectId to list issues for a project, or omit it to list issues across all projects visible to the user. Use when the user asks to see issues, bugs, or tasks.',
    inputSchema: z.object({
        gitlabToken: tokenField,
        projectId: projectField.optional(),
        state: z.enum(['opened', 'closed', 'all']).optional().describe('Filter by issue state'),
        labels: z.string().optional().describe('Comma-separated list of label names to filter by'),
        search: z.string().optional().describe('Search issues by title and description'),
        perPage: z.number().min(1).max(100).optional().default(20).describe('Results per page (max 100)'),
        page: z.number().min(1).optional().default(1).describe('Page number'),
    }),
    execute: async ({ gitlabToken, projectId, state, labels, search, perPage = 20, page = 1 }) => {
        const path = projectId ? `/projects/${encodeId(projectId)}/issues` : '/issues';
        return gitlabRequest(gitlabToken, path, {
            query: { state, labels, search, per_page: perPage, page },
        });
    },
});

export const gitlabGetIssue = tool({
    description:
        'Get a single GitLab issue by its internal ID (iid) within a project. Use when the user asks for details of a specific issue.',
    inputSchema: z.object({
        gitlabToken: tokenField,
        projectId: projectField,
        issueIid: z.union([z.string(), z.number()]).describe('Internal ID (iid) of the issue within the project'),
    }),
    execute: async ({ gitlabToken, projectId, issueIid }) => {
        return gitlabRequest(gitlabToken, `/projects/${encodeId(projectId)}/issues/${issueIid}`);
    },
});

export const gitlabCreateIssue = tool({
    description:
        'Create a new GitLab issue in a project. Use when the user wants to file a bug, open an issue, or create a task.',
    inputSchema: z.object({
        gitlabToken: tokenField,
        projectId: projectField,
        title: z.string().describe('Issue title'),
        description: z.string().optional().describe('Issue description (Markdown supported)'),
        labels: z.string().optional().describe('Comma-separated list of label names'),
        assigneeIds: z.array(z.number()).optional().describe('User IDs to assign the issue to'),
    }),
    execute: async ({ gitlabToken, projectId, title, description, labels, assigneeIds }) => {
        return gitlabRequest(gitlabToken, `/projects/${encodeId(projectId)}/issues`, {
            method: 'POST',
            body: { title, description, labels, assignee_ids: assigneeIds },
        });
    },
});

export const gitlabUpdateIssue = tool({
    description:
        'Update a GitLab issue (title, description, state, labels). Use when the user wants to edit, close, or reopen an issue.',
    inputSchema: z.object({
        gitlabToken: tokenField,
        projectId: projectField,
        issueIid: z.union([z.string(), z.number()]).describe('Internal ID (iid) of the issue within the project'),
        title: z.string().optional().describe('New issue title'),
        description: z.string().optional().describe('New issue description'),
        stateEvent: z.enum(['close', 'reopen']).optional().describe('Close or reopen the issue'),
        labels: z.string().optional().describe('Comma-separated list of label names (replaces existing labels)'),
    }),
    execute: async ({ gitlabToken, projectId, issueIid, title, description, stateEvent, labels }) => {
        return gitlabRequest(gitlabToken, `/projects/${encodeId(projectId)}/issues/${issueIid}`, {
            method: 'PUT',
            body: { title, description, state_event: stateEvent, labels },
        });
    },
});

export const gitlabListIssueNotes = tool({
    description:
        'List comments (notes) on a GitLab issue. Use when the user asks to see discussion or comments on an issue.',
    inputSchema: z.object({
        gitlabToken: tokenField,
        projectId: projectField,
        issueIid: z.union([z.string(), z.number()]).describe('Internal ID (iid) of the issue within the project'),
        perPage: z.number().min(1).max(100).optional().default(20).describe('Results per page (max 100)'),
        page: z.number().min(1).optional().default(1).describe('Page number'),
    }),
    execute: async ({ gitlabToken, projectId, issueIid, perPage = 20, page = 1 }) => {
        return gitlabRequest(gitlabToken, `/projects/${encodeId(projectId)}/issues/${issueIid}/notes`, {
            query: { per_page: perPage, page },
        });
    },
});

export const gitlabCreateIssueNote = tool({
    description:
        'Add a comment (note) to a GitLab issue. Use when the user wants to comment on or reply to an issue.',
    inputSchema: z.object({
        gitlabToken: tokenField,
        projectId: projectField,
        issueIid: z.union([z.string(), z.number()]).describe('Internal ID (iid) of the issue within the project'),
        body: z.string().describe('Comment text (Markdown supported)'),
    }),
    execute: async ({ gitlabToken, projectId, issueIid, body }) => {
        return gitlabRequest(gitlabToken, `/projects/${encodeId(projectId)}/issues/${issueIid}/notes`, {
            method: 'POST',
            body: { body },
        });
    },
});
