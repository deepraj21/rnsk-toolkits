// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { Octokit } from 'octokit';

export const searchLabels = tool({
    description: 'Search labels. Find labels in a repository with names or descriptions that match search keywords.',
    inputSchema: z.object({
        githubToken: z.string().optional().describe('Injected by system; do not provide'),
        repository_id: z.number().describe('The id of the repository.'),
        q: z.string().describe('The search keywords. This endpoint does not accept qualifiers in the query string.'),
        sort: z.enum(['created', 'updated']).optional().describe('Sorts the results of your query.'),
        order: z.enum(['desc', 'asc']).optional().describe('Determines whether the first search result returned is the highest number of matches (desc) or lowest number of matches (asc).'),
        per_page: z.number().optional().describe('Results per page (max 100).'),
    }),
    execute: async ({ githubToken, repository_id, q, sort, order, per_page }) => {
        if (!githubToken) {
            return { error: 'GitHub token is required. Connect GitHub first.' };
        }
        const octokit = new Octokit({ auth: githubToken });
        try {
            const { data } = await octokit.rest.search.labels({
                repository_id,
                q,
                sort,
                order,
                per_page,
            });
            return data;
        } catch (error: any) {
            return { error: `Failed to search labels: ${error.message}` };
        }
    },
});
