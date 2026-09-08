// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { Octokit } from 'octokit';

export const listEnvironments = tool({
    description: 'List environments for a repository.',
    inputSchema: z.object({
        githubToken: z.string().optional().describe('Injected by system; do not provide'),
        owner: z.string().describe('Repository owner (username or org)'),
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
            const { data } = await octokit.rest.repos.getAllEnvironments({
                owner,
                repo,
                per_page: per_page ?? 30,
                page: page ?? 1,
            });
            if (!data) return { error: 'No data returned from GitHub API' };
            return {
                total_count: data.total_count,
                environments: data.environments?.map(env => ({
                    id: env.id,
                    name: env.name,
                    url: env.url,
                    html_url: env.html_url,
                    created_at: env.created_at,
                    updated_at: env.updated_at,
                })),
            };
        } catch (error: any) {
            return { error: `Failed to list environments: ${error.message}` };
        }
    },
});
