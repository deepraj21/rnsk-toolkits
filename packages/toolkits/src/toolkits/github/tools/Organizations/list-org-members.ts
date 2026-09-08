// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { Octokit } from 'octokit';

export const listOrgMembers = tool({
    description: 'List organization members.',
    inputSchema: z.object({
        githubToken: z.string().optional().describe('Injected by system; do not provide'),
        org: z.string().describe('The organization name'),
        filter: z.enum(['2fa_disabled', 'all']).optional().describe('Filter by 2fa status'),
        role: z.enum(['all', 'admin', 'member']).optional().describe('Filter by role'),
        per_page: z.number().optional().describe('Number of results per page (max 100)'),
        page: z.number().optional().describe('Page number of results to fetch'),
    }),
    execute: async ({ githubToken, org, filter, role, per_page, page }) => {
        if (!githubToken) {
            return { error: 'GitHub token is required. Connect GitHub first.' };
        }
        const octokit = new Octokit({ auth: githubToken });
        try {
            const { data } = await octokit.rest.orgs.listMembers({
                org,
                filter,
                role,
                per_page: per_page ?? 30,
                page: page ?? 1,
            });
            if (!data) return { error: 'No data returned from GitHub API' };
            return data.map(member => ({
                login: member.login,
                id: member.id,
                avatar_url: member.avatar_url,
                url: member.url,
                html_url: member.html_url,
                type: member.type,
            }));
        } catch (error: any) {
            return { error: `Failed to list org members: ${error.message}` };
        }
    },
});
