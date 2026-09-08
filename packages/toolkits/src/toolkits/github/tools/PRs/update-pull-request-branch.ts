// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { Octokit } from 'octokit';

export const updatePullRequestBranch = tool({
    description: 'Update a pull request branch with the latest changes from the base branch.',
    inputSchema: z.object({
        githubToken: z.string().optional().describe('Injected by system; do not provide'),
        owner: z.string().describe('Repository owner'),
        repo: z.string().describe('Repository name'),
        pullNumber: z.number().describe('Pull request number'),
        expected_head_sha: z.string().optional().describe('The expected SHA of the pull request\'s HEAD ref. This is the most recent commit on the pull request\'s branch. If the SHA has changed since you fetched it, the update will fail.'),
    }),
    execute: async ({ githubToken, owner, repo, pullNumber, expected_head_sha }) => {
        if (!githubToken) {
            return { error: 'GitHub token is required. Connect GitHub first.' };
        }
        const octokit = new Octokit({ auth: githubToken });
        try {
            const { data } = await octokit.rest.pulls.updateBranch({
                owner,
                repo,
                pull_number: pullNumber,
                expected_head_sha,
            });
            return {
                message: data.message,
                url: data.url,
            };
        } catch (error: any) {
            return { error: `Failed to update PR branch: ${error.message}` };
        }
    },
});
