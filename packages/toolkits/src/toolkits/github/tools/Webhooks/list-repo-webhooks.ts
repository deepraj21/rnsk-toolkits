// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { Octokit } from 'octokit';

export const listRepoWebhooks = tool({
    description: 'List webhooks for a repository.',
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
            const { data } = await octokit.rest.repos.listWebhooks({
                owner,
                repo,
                per_page: per_page ?? 30,
                page: page ?? 1,
            });
            if (!data) return { error: 'No data returned from GitHub API' };
            return data.map(hook => ({
                id: hook.id,
                name: hook.name,
                active: hook.active,
                events: hook.events,
                config: hook.config,
                updated_at: hook.updated_at,
                created_at: hook.created_at,
                url: hook.url,
                test_url: hook.test_url,
                ping_url: hook.ping_url,
                last_response: hook.last_response,
            }));
        } catch (error: any) {
            return { error: `Failed to list repository webhooks: ${error.message}` };
        }
    },
});
