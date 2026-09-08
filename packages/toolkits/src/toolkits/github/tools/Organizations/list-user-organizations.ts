// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { Octokit } from 'octokit';

export const listUserOrganizations = tool({
    description: 'List organizations for the authenticated user.',
    inputSchema: z.object({
        githubToken: z.string().optional().describe('Injected by system; do not provide'),
        per_page: z.number().optional().describe('Number of results per page (max 100)'),
        page: z.number().optional().describe('Page number of results to fetch'),
    }),
    execute: async ({ githubToken, per_page, page }) => {
        if (!githubToken) {
            return { error: 'GitHub token is required. Connect GitHub first.' };
        }
        const octokit = new Octokit({ auth: githubToken });
        try {
            const { data } = await octokit.rest.orgs.listForAuthenticatedUser({
                per_page: per_page ?? 30,
                page: page ?? 1,
            });
            if (!data) return { error: 'No data returned from GitHub API' };
            return data.map(org => ({
                login: org.login,
                id: org.id,
                url: org.url,
                repos_url: org.repos_url,
                events_url: org.events_url,
                hooks_url: org.hooks_url,
                issues_url: org.issues_url,
                members_url: org.members_url,
                public_members_url: org.public_members_url,
                avatar_url: org.avatar_url,
                description: org.description,
            }));
        } catch (error: any) {
            return { error: `Failed to list user organizations: ${error.message}` };
        }
    },
});
