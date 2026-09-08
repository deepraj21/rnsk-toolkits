// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { Octokit } from 'octokit';

export const deleteDeployKey = tool({
    description: 'Delete a deploy key from a repository.',
    inputSchema: z.object({
        githubToken: z.string().optional().describe('Injected by system; do not provide'),
        owner: z.string().describe('Repository owner (username or org)'),
        repo: z.string().describe('Repository name'),
        key_id: z.number().describe('The unique identifier of the key'),
    }),
    execute: async ({ githubToken, owner, repo, key_id }) => {
        if (!githubToken) {
            return { error: 'GitHub token is required. Connect GitHub first.' };
        }
        const octokit = new Octokit({ auth: githubToken });
        try {
            await octokit.rest.repos.deleteDeployKey({
                owner,
                repo,
                key_id,
            });
            return { message: `Successfully deleted deploy key ${key_id}` };
        } catch (error: any) {
            return { error: `Failed to delete deploy key: ${error.message}` };
        }
    },
});
