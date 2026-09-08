// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { Octokit } from 'octokit';

export const searchCommits = tool({
    description: 'Search commits. Find commits via various criteria on the default branch (usually master).',
    inputSchema: z.object({
        githubToken: z.string().optional().describe('Injected by system; do not provide'),
        q: z.string().describe('The query contains one or more search keywords and qualifiers. Qualifiers allow you to limit your search to specific areas of GitHub.'),
        sort: z.enum(['author-date', 'committer-date']).optional().describe('Sorts the results of your query.'),
        order: z.enum(['desc', 'asc']).optional().describe('Determines whether the first search result returned is the highest number of matches (desc) or lowest number of matches (asc).'),
        per_page: z.number().optional().describe('Results per page (max 100).'),
    }),
    execute: async ({ githubToken, q, sort, order, per_page }) => {
        if (!githubToken) {
            return { error: 'GitHub token is required. Connect GitHub first.' };
        }
        const octokit = new Octokit({ auth: githubToken });
        try {
            const { data } = await octokit.rest.search.commits({
                q,
                sort,
                order,
                per_page,
            });
            return data;
        } catch (error: any) {
            return { error: `Failed to search commits: ${error.message}` };
        }
    },
});
