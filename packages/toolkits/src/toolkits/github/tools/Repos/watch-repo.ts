// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { Octokit } from 'octokit';

export const watchRepo = tool({
    description: 'Set subscription status (watch/unwatch) for a repository.',
    inputSchema: z.object({
        githubToken: z.string().optional().describe('Injected by system; do not provide'),
        owner: z.string().describe('Repository owner'),
        repo: z.string().describe('Repository name'),
        ignored: z.boolean().optional().describe('If true, ignore notifications'),
        subscribed: z.boolean().optional().describe('If true, subscribe to notifications'),
    }),
    execute: async ({ githubToken, owner, repo, ignored = false, subscribed = true }) => {
        if (!githubToken) {
            return { error: 'GitHub token is required. Connect GitHub first.' };
        }
        const octokit = new Octokit({ auth: githubToken });
        try {
            const { data } = await octokit.rest.activity.setRepoSubscription({
                owner,
                repo,
                ignored,
                subscribed,
            });
            return {
                subscribed: data.subscribed,
                ignored: data.ignored,
                message: `Updated watch status for ${owner}/${repo}`,
            };
        } catch (error: any) {
            return { error: `Failed to update watch status: ${error.message}` };
        }
    },
});
