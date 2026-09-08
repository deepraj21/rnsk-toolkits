// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { Octokit } from 'octokit';

export const checkRepoStarred = tool({
    description: 'Check if a repository is starred by the authenticated user.',
    inputSchema: z.object({
        githubToken: z.string().optional().describe('Injected by system; do not provide'),
        owner: z.string().describe('Repository owner (username or org)'),
        repo: z.string().describe('Repository name'),
    }),
    execute: async ({ githubToken, owner, repo }) => {
        if (!githubToken) {
            return { error: 'GitHub token is required. Connect GitHub first.' };
        }
        const octokit = new Octokit({ auth: githubToken });
        try {
            await octokit.rest.activity.checkRepoIsStarredByAuthenticatedUser({
                owner,
                repo,
            });
            return { is_starred: true };
        } catch (error: any) {
            if (error.status === 404) {
                return { is_starred: false };
            }
            return { error: `Failed to check if repo is starred: ${error.message}` };
        }
    },
});
