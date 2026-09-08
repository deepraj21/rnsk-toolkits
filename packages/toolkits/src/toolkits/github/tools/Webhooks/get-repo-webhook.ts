// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { Octokit } from 'octokit';

export const getRepoWebhook = tool({
    description: 'Get a webhook for a repository.',
    inputSchema: z.object({
        githubToken: z.string().optional().describe('Injected by system; do not provide'),
        owner: z.string().describe('Repository owner (username or org)'),
        repo: z.string().describe('Repository name'),
        hook_id: z.number().describe('The unique identifier of the webhook'),
    }),
    execute: async ({ githubToken, owner, repo, hook_id }) => {
        if (!githubToken) {
            return { error: 'GitHub token is required. Connect GitHub first.' };
        }
        const octokit = new Octokit({ auth: githubToken });
        try {
            const { data } = await octokit.rest.repos.getWebhook({
                owner,
                repo,
                hook_id,
            });
            if (!data) return { error: 'No data returned from GitHub API' };
            return {
                id: data.id,
                name: data.name,
                active: data.active,
                events: data.events,
                config: data.config,
                updated_at: data.updated_at,
                created_at: data.created_at,
            };
        } catch (error: any) {
            return { error: `Failed to get repository webhook: ${error.message}` };
        }
    },
});
