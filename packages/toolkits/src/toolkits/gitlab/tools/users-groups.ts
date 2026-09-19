// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { gitlabRequest } from './client.js';

const tokenField = z.string().optional().describe('Injected by system; do not provide');

export const gitlabGetCurrentUser = tool({
    description:
        'Get the authenticated GitLab user profile. Use when the user asks who they are logged in as, or to get their username, ID, or email.',
    inputSchema: z.object({
        gitlabToken: tokenField,
    }),
    execute: async ({ gitlabToken }) => {
        return gitlabRequest(gitlabToken, '/user');
    },
});

export const gitlabListGroups = tool({
    description:
        'List GitLab groups visible to the authenticated user. Use when the user asks to see their groups or namespaces.',
    inputSchema: z.object({
        gitlabToken: tokenField,
        search: z.string().optional().describe('Search groups by name or path'),
        owned: z.boolean().optional().describe('Limit to groups explicitly owned by the user'),
        perPage: z.number().min(1).max(100).optional().default(20).describe('Results per page (max 100)'),
        page: z.number().min(1).optional().default(1).describe('Page number'),
    }),
    execute: async ({ gitlabToken, search, owned, perPage = 20, page = 1 }) => {
        return gitlabRequest(gitlabToken, '/groups', {
            query: { search, owned, per_page: perPage, page },
        });
    },
});
