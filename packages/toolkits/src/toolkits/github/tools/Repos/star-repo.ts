// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { Octokit } from 'octokit';

export const starRepo = tool({
    description: 'Star or unstar a GitHub repository.',
    inputSchema: z.object({
        githubToken: z.string().optional().describe('Injected by system; do not provide'),
        owner: z.string().describe('Repository owner'),
        repo: z.string().describe('Repository name'),
        action: z.enum(['star', 'unstar']).describe('Action to perform'),
    }),
    execute: async ({ githubToken, owner, repo, action }) => {
        if (!githubToken) {
            return { error: 'GitHub token is required. Connect GitHub first.' };
        }
        const octokit = new Octokit({ auth: githubToken });
        try {
            if (action === 'star') {
                await octokit.rest.activity.starRepoForAuthenticatedUser({
                    owner,
                    repo,
                });
                return { message: `Starred ${owner}/${repo}` };
            } else {
                await octokit.rest.activity.unstarRepoForAuthenticatedUser({
                    owner,
                    repo,
                });
                return { message: `Unstarred ${owner}/${repo}` };
            }
        } catch (error: any) {
            return { error: `Failed to ${action} repo: ${error.message}` };
        }
    },
});
