// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { Octokit } from 'octokit';

export const searchTopics = tool({
    description: 'Search topics. Find topics via various criteria.',
    inputSchema: z.object({
        githubToken: z.string().optional().describe('Injected by system; do not provide'),
        q: z.string().describe('The query contains one or more search keywords and qualifiers. Qualifiers allow you to limit your search to specific areas of GitHub.'),
        per_page: z.number().optional().describe('Results per page (max 100).'),
    }),
    execute: async ({ githubToken, q, per_page }) => {
        if (!githubToken) {
            return { error: 'GitHub token is required. Connect GitHub first.' };
        }
        const octokit = new Octokit({ auth: githubToken });
        try {
            const { data } = await octokit.rest.search.topics({
                q,
                per_page,
            });
            return data;
        } catch (error: any) {
            return { error: `Failed to search topics: ${error.message}` };
        }
    },
});
