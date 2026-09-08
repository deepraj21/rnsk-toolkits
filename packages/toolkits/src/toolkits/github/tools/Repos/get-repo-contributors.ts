// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { Octokit } from 'octokit';

export const getRepoContributors = tool({
    description: 'List contributors for a GitHub repository.',
    inputSchema: z.object({
        githubToken: z.string().optional().describe('Injected by system; do not provide'),
        owner: z.string().describe('Repository owner'),
        repo: z.string().describe('Repository name'),
        perPage: z.number().optional().default(30),
    }),
    execute: async ({ githubToken, owner, repo, perPage = 30 }) => {
        if (!githubToken) {
            return { error: 'GitHub token is required. Connect GitHub first.' };
        }
        const octokit = new Octokit({ auth: githubToken });
        try {
            const { data } = await octokit.rest.repos.listContributors({
                owner,
                repo,
                per_page: perPage,
            });
            return {
                contributors: data.map((c) => ({
                    login: c.login,
                    contributions: c.contributions,
                    avatar_url: c.avatar_url,
                    html_url: c.html_url,
                })),
                count: data.length,
            };
        } catch (error: any) {
            return { error: `Failed to get contributors: ${error.message}` };
        }
    },
});
