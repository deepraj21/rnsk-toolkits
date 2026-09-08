// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { Octokit } from 'octokit';

export const listTeams = tool({
    description: 'List teams in an organization.',
    inputSchema: z.object({
        githubToken: z.string().optional().describe('Injected by system; do not provide'),
        org: z.string().describe('The organization name'),
        per_page: z.number().optional().describe('Number of results per page (max 100)'),
        page: z.number().optional().describe('Page number of results to fetch'),
    }),
    execute: async ({ githubToken, org, per_page, page }) => {
        if (!githubToken) {
            return { error: 'GitHub token is required. Connect GitHub first.' };
        }
        const octokit = new Octokit({ auth: githubToken });
        try {
            const { data } = await octokit.rest.teams.list({
                org,
                per_page: per_page ?? 30,
                page: page ?? 1,
            });
            if (!data) return { error: 'No data returned from GitHub API' };
            return data.map(team => ({
                id: team.id,
                name: team.name,
                slug: team.slug,
                description: team.description,
                privacy: team.privacy,
                url: team.url,
                members_url: team.members_url,
                repositories_url: team.repositories_url,
            }));
        } catch (error: any) {
            return { error: `Failed to list teams: ${error.message}` };
        }
    },
});
