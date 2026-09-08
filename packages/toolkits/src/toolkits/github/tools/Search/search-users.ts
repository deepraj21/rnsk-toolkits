// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { Octokit } from 'octokit';

export const searchUsers = tool({
    description: 'Search for GitHub users.',
    inputSchema: z.object({
        githubToken: z.string().optional().describe('Injected by system; do not provide'),
        q: z.string().describe('Search query (e.g., "tom repos:>42 followers:>1000")'),
        sort: z.enum(['followers', 'repositories', 'joined']).optional(),
        order: z.enum(['asc', 'desc']).optional().default('desc'),
        perPage: z.number().optional().default(10),
    }),
    execute: async ({ githubToken, q, sort, order = 'desc', perPage = 10 }) => {
        if (!githubToken) {
            return { error: 'GitHub token is required. Connect GitHub first.' };
        }
        const octokit = new Octokit({ auth: githubToken });
        try {
            const { data } = await octokit.rest.search.users({
                q,
                sort,
                order,
                per_page: perPage,
            });
            return {
                total_count: data.total_count,
                items: data.items.map((user) => ({
                    login: user.login,
                    html_url: user.html_url,
                    avatar_url: user.avatar_url,
                    type: user.type,
                })),
            };
        } catch (error: any) {
            return { error: `Failed to search users: ${error.message}` };
        }
    },
});
