// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { Octokit } from 'octokit';

export const listTeamRepos = tool({
    description: 'List repositories accessible to a team.',
    inputSchema: z.object({
        githubToken: z.string().optional().describe('Injected by system; do not provide'),
        org: z.string().describe('The organization name'),
        team_slug: z.string().describe('The slug of the team'),
        per_page: z.number().optional().describe('Number of results per page (max 100)'),
        page: z.number().optional().describe('Page number of results to fetch'),
    }),
    execute: async ({ githubToken, org, team_slug, per_page, page }) => {
        if (!githubToken) {
            return { error: 'GitHub token is required. Connect GitHub first.' };
        }
        const octokit = new Octokit({ auth: githubToken });
        try {
            const { data } = await octokit.rest.teams.listReposInOrg({
                org,
                team_slug,
                per_page: per_page ?? 30,
                page: page ?? 1,
            });
            if (!data) return { error: 'No data returned from GitHub API' };
            return data.map(repo => ({
                id: repo.id,
                name: repo.name,
                full_name: repo.full_name,
                owner: repo.owner.login,
                permissions: repo.permissions,
            }));
        } catch (error: any) {
            return { error: `Failed to list team repos: ${error.message}` };
        }
    },
});
