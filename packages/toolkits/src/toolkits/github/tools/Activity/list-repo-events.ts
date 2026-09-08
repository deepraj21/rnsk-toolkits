// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { Octokit } from 'octokit';

export const listRepoEvents = tool({
    description: 'List events for a repository. Returns recent activity for a specific repository.',
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
            const { data } = await octokit.rest.activity.listRepoEvents({
                owner,
                repo,
                per_page: per_page ?? 30,
                page: page ?? 1,
            });
            return {
                events: data.map(event => ({
                    id: event.id,
                    type: event.type,
                    actor: event.actor?.login,
                    created_at: event.created_at,
                })),
            };
        } catch (error: any) {
            return { error: `Failed to list repository events: ${error.message}` };
        }
    },
});
