// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { Octokit } from 'octokit';

export const deleteRepoWebhook = tool({
    description: 'Delete a webhook from a repository.',
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
            await octokit.rest.repos.deleteWebhook({
                owner,
                repo,
                hook_id,
            });
            return { message: `Successfully deleted repository webhook ${hook_id}` };
        } catch (error: any) {
            return { error: `Failed to delete repository webhook: ${error.message}` };
        }
    },
});
