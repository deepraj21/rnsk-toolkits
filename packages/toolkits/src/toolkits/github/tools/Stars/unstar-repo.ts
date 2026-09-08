// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { Octokit } from 'octokit';

export const unstarRepo = tool({
    description: 'Unstar a repository for the authenticated user.',
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
            await octokit.rest.activity.unstarRepoForAuthenticatedUser({
                owner,
                repo,
            });
            return { message: `Successfully unstarred repository ${owner}/${repo}` };
        } catch (error: any) {
            return { error: `Failed to unstar repository: ${error.message}` };
        }
    },
});
