// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { Octokit } from 'octokit';

export const listStargazers = tool({
    description: 'List stargazers for a repository.',
    inputSchema: z.object({
        githubToken: z.string().optional().describe('Injected by system; do not provide'),
        owner: z.string().describe('Repository owner'),
        repo: z.string().describe('Repository name'),
        per_page: z.number().optional().describe('Number of results per page (max 100)'),
        page: z.number().optional().describe('Page number of results to fetch'),
    }),
    execute: async ({ githubToken, owner, repo, per_page, page }) => {
        if (!githubToken) {
            return { error: 'GitHub token is required. Connect GitHub first.' };
        }
        const octokit = new Octokit({ auth: githubToken });
        try {
            const { data } = await octokit.rest.activity.listStargazersForRepo({
                owner,
                repo,
                per_page: per_page ?? 30,
                page: page ?? 1,
            });
            if (!data) return { error: 'No data returned from GitHub API' };
            return (data as any[]).map((user: any) => ({
                login: user.login || user.user?.login,
                id: user.id || user.user?.id,
                avatar_url: user.avatar_url || user.user?.avatar_url,
                html_url: user.html_url || user.user?.html_url,
            }));
        } catch (error: any) {
            return { error: `Failed to list stargazers: ${error.message}` };
        }
    },
});
