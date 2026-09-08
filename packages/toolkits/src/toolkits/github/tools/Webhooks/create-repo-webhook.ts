// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { Octokit } from 'octokit';

export const createRepoWebhook = tool({
    description: 'Create a webhook for a repository.',
    inputSchema: z.object({
        githubToken: z.string().optional().describe('Injected by system; do not provide'),
        owner: z.string().describe('Repository owner (username or org)'),
        repo: z.string().describe('Repository name'),
        name: z.string().optional().describe('The name of the webhook. Default: "web"'),
        active: z.boolean().optional().describe('Determines if notifications are sent when the webhook is triggered'),
        events: z.array(z.string()).optional().describe('Determines what events the hook is triggered for'),
        config: z.object({
            url: z.string().describe('The URL to which the payloads will be delivered'),
            content_type: z.string().optional().describe('The media type used to serialize the payloads'),
            secret: z.string().optional().describe('If provided, payloads will be delivered with an X-Hub-Signature header'),
            insecure_ssl: z.string().optional().describe('Determines whether the SSL certificate of the host for url will be verified'),
        }).describe('Key/value pairs to provide settings for this webhook'),
    }),
    execute: async ({ githubToken, owner, repo, ...options }) => {
        if (!githubToken) {
            return { error: 'GitHub token is required. Connect GitHub first.' };
        }
        const octokit = new Octokit({ auth: githubToken });
        try {
            const { data } = await octokit.rest.repos.createWebhook({
                owner,
                repo,
                ...options,
            });
            if (!data) return { error: 'No data returned from GitHub API' };
            return {
                id: data.id,
                name: data.name,
                active: data.active,
                events: data.events,
                config: data.config,
            };
        } catch (error: any) {
            return { error: `Failed to create repository webhook: ${error.message}` };
        }
    },
});
