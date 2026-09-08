// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { Octokit } from 'octokit';

export const searchRepos = tool({
    description: 'Search for GitHub repositories using a query string.',
    inputSchema: z.object({
        githubToken: z.string().optional().describe('Injected by system; do not provide'),
        query: z.string().describe('Search query (e.g., "topic:react stars:>1000")'),
        sort: z.enum(['stars', 'forks', 'help-wanted-issues', 'updated']).optional(),
        order: z.enum(['asc', 'desc']).optional().default('desc'),
        perPage: z.number().optional().default(10),
    }),
    execute: async ({ githubToken, query, sort, order = 'desc', perPage = 10 }) => {
        if (!githubToken) {
            return { error: 'GitHub token is required. Connect GitHub first.' };
        }
        const octokit = new Octokit({ auth: githubToken });
        try {
            let searchQuery = query;
            if (searchQuery.includes('YOUR_USERNAME')) {
                const user = await octokit.rest.users.getAuthenticated();
                searchQuery = searchQuery.replace(/YOUR_USERNAME/g, user.data.login);
            }

            const { data } = await octokit.rest.search.repos({
                q: searchQuery,
                sort,
                order,
                per_page: perPage,
            });
            return {
                total_count: data.total_count,
                items: data.items.map((repo) => ({
                    full_name: repo.full_name,
                    description: repo.description,
                    html_url: repo.html_url,
                    stargazers_count: repo.stargazers_count,
                    language: repo.language,
                })),
            };
        } catch (error: any) {
            return { error: `Failed to search repos: ${error.message}` };
        }
    },
});
