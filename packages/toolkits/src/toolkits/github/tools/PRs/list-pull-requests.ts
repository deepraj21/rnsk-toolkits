// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { Octokit } from 'octokit';

export const listPullRequests = tool({
    description: 'List pull requests for a GitHub repository.',
    inputSchema: z.object({
        githubToken: z.string().optional().describe('Injected by system; do not provide'),
        owner: z.string().describe('Repository owner'),
        repo: z.string().describe('Repository name'),
        state: z.enum(['open', 'closed', 'all']).optional().default('open'),
        perPage: z.number().optional().default(30),
    }),
    execute: async ({ githubToken, owner, repo, state = 'open', perPage = 30 }) => {
        if (!githubToken) {
            return { error: 'GitHub token is required. Connect GitHub first.' };
        }
        const octokit = new Octokit({ auth: githubToken });
        try {
            const { data } = await octokit.rest.pulls.list({
                owner,
                repo,
                state,
                per_page: perPage,
            });
            return {
                pull_requests: data.map((pr) => ({
                    number: pr.number,
                    title: pr.title,
                    state: pr.state,
                    html_url: pr.html_url,
                    user: pr.user?.login,
                    head: pr.head.ref,
                    base: pr.base.ref,
                })),
                count: data.length,
            };
        } catch (error: any) {
            return { error: `Failed to list PRs: ${error.message}` };
        }
    },
});
