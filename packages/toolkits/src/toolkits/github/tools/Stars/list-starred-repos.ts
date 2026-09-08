// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { Octokit } from 'octokit';

export const listStarredRepos = tool({
    description: 'List repositories starred by the authenticated user.',
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
            const { data } = await octokit.rest.activity.listReposStarredByAuthenticatedUser({
                per_page: per_page ?? 30,
                page: page ?? 1,
            });
            if (!data) return { error: 'No data returned from GitHub API' };
            return data.map(repo => ({
                id: repo.id,
                name: repo.name,
                full_name: repo.full_name,
                owner: repo.owner.login,
                html_url: repo.html_url,
                stargazers_count: repo.stargazers_count,
            }));
        } catch (error: any) {
            return { error: `Failed to list starred repos: ${error.message}` };
        }
    },
});
