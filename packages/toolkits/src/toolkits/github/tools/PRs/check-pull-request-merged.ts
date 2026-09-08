// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { Octokit } from 'octokit';

export const checkPullRequestMerged = tool({
    description: 'Check if a pull request has been merged.',
    inputSchema: z.object({
        githubToken: z.string().optional().describe('Injected by system; do not provide'),
        owner: z.string().describe('Repository owner'),
        repo: z.string().describe('Repository name'),
        pullNumber: z.number().describe('Pull request number'),
    }),
    execute: async ({ githubToken, owner, repo, pullNumber }) => {
        if (!githubToken) {
            return { error: 'GitHub token is required. Connect GitHub first.' };
        }
        const octokit = new Octokit({ auth: githubToken });
        try {
            const { status } = await octokit.rest.pulls.checkIfMerged({
                owner,
                repo,
                pull_number: pullNumber,
            });
            return { merged: status === 204 };
        } catch (error: any) {
            if (error.status === 404) {
                return { merged: false };
            }
            return { error: `Failed to check PR merge status: ${error.message}` };
        }
    },
});
