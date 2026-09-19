// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { gitlabRequest, encodeId } from './client.js';

const tokenField = z.string().optional().describe('Injected by system; do not provide');
const projectField = z
    .union([z.string(), z.number()])
    .describe('Project ID or URL-encoded path (e.g. 123 or "group/project")');

export const gitlabListProjects = tool({
    description:
        'List GitLab projects for the authenticated user. Use when the user asks to see their projects, browse repos, or find a project by name. Supports search, ownership filter, and pagination.',
    inputSchema: z.object({
        gitlabToken: tokenField,
        search: z.string().optional().describe('Search query to filter projects by name or path'),
        owned: z.boolean().optional().describe('Limit to projects explicitly owned by the authenticated user'),
        membership: z.boolean().optional().describe('Limit to projects the user is a member of'),
        orderBy: z.enum(['id', 'name', 'path', 'created_at', 'updated_at', 'last_activity_at']).optional().describe('Field to order results by'),
        sort: z.enum(['asc', 'desc']).optional().describe('Sort direction'),
        perPage: z.number().min(1).max(100).optional().default(20).describe('Results per page (max 100)'),
        page: z.number().min(1).optional().default(1).describe('Page number'),
    }),
    execute: async ({ gitlabToken, search, owned, membership, orderBy, sort, perPage = 20, page = 1 }) => {
        return gitlabRequest(gitlabToken, '/projects', {
            query: { search, owned, membership, order_by: orderBy, sort, per_page: perPage, page },
        });
    },
});

export const gitlabGetProject = tool({
    description:
        'Get detailed information about a single GitLab project. Use when the user asks for project details, settings, or stats for a specific project.',
    inputSchema: z.object({
        gitlabToken: tokenField,
        projectId: projectField,
    }),
    execute: async ({ gitlabToken, projectId }) => {
        return gitlabRequest(gitlabToken, `/projects/${encodeId(projectId)}`);
    },
});

export const gitlabCreateProject = tool({
    description:
        'Create a new GitLab project. Use when the user wants to create a project or repository on GitLab.',
    inputSchema: z.object({
        gitlabToken: tokenField,
        name: z.string().describe('New project name'),
        description: z.string().optional().describe('Project description'),
        visibility: z.enum(['private', 'internal', 'public']).optional().describe('Project visibility level'),
        initializeWithReadme: z.boolean().optional().describe('Initialize the project with a README'),
        defaultBranch: z.string().optional().describe('Default branch name, e.g. "main"'),
        namespaceId: z.union([z.string(), z.number()]).optional().describe('Namespace (group or user) ID to create the project under'),
    }),
    execute: async ({ gitlabToken, name, description, visibility, initializeWithReadme, defaultBranch, namespaceId }) => {
        return gitlabRequest(gitlabToken, '/projects', {
            method: 'POST',
            body: {
                name,
                description,
                visibility,
                initialize_with_readme: initializeWithReadme,
                default_branch: defaultBranch,
                namespace_id: namespaceId,
            },
        });
    },
});

export const gitlabUpdateProject = tool({
    description:
        'Update a GitLab project (name, description, visibility, default branch). Use when the user wants to edit project settings.',
    inputSchema: z.object({
        gitlabToken: tokenField,
        projectId: projectField,
        name: z.string().optional().describe('New project name'),
        description: z.string().optional().describe('New project description'),
        visibility: z.enum(['private', 'internal', 'public']).optional().describe('New visibility level'),
        defaultBranch: z.string().optional().describe('New default branch'),
    }),
    execute: async ({ gitlabToken, projectId, name, description, visibility, defaultBranch }) => {
        return gitlabRequest(gitlabToken, `/projects/${encodeId(projectId)}`, {
            method: 'PUT',
            body: {
                name,
                description,
                visibility,
                default_branch: defaultBranch,
            },
        });
    },
});

export const gitlabDeleteProject = tool({
    description:
        'Delete a GitLab project. Use only when the user explicitly asks to delete or remove a project. This is irreversible.',
    inputSchema: z.object({
        gitlabToken: tokenField,
        projectId: projectField,
    }),
    execute: async ({ gitlabToken, projectId }) => {
        return gitlabRequest(gitlabToken, `/projects/${encodeId(projectId)}`, { method: 'DELETE' });
    },
});
