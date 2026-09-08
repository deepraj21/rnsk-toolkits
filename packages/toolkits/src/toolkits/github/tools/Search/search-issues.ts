// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { Octokit } from 'octokit';

export const searchIssues = tool({
    description: 'Search for GitHub issues and pull requests.',
    inputSchema: z.object({
        githubToken: z.string().optional().describe('Injected by system; do not provide'),
        q: z.string().describe('Search query (e.g., "is:issue state:open port")'),
        sort: z.enum(['comments', 'reactions', 'reactions-+1', 'reactions--1', 'reactions-smile', 'reactions-thinking_face', 'reactions-heart', 'reactions-tada', 'updated', 'created']).optional(),
        order: z.enum(['asc', 'desc']).optional().default('desc'),
        perPage: z.number().optional().default(10),
    }),
    execute: async ({ githubToken, q, sort, order = 'desc', perPage = 10 }) => {
        if (!githubToken) {
            return { error: 'GitHub token is required. Connect GitHub first.' };
        }
        const octokit = new Octokit({ auth: githubToken });
        try {
            const { data } = await octokit.rest.search.issuesAndPullRequests({
                q,
                sort,
                order,
                per_page: perPage,
            });
            return {
                total_count: data.total_count,
                items: data.items.map((item) => ({
                    number: item.number,
                    title: item.title,
                    state: item.state,
                    html_url: item.html_url,
                    user: item.user?.login,
                    pull_request: !!item.pull_request,
                })),
            };
        } catch (error: any) {
            return { error: `Failed to search issues: ${error.message}` };
        }
    },
});
