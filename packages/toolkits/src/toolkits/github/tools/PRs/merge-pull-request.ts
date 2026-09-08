// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { Octokit } from 'octokit';

export const mergePullRequest = tool({
    description: 'Merge a pull request.',
    inputSchema: z.object({
        githubToken: z.string().optional().describe('Injected by system; do not provide'),
        owner: z.string().describe('Repository owner'),
        repo: z.string().describe('Repository name'),
        pullNumber: z.number().describe('Pull request number'),
        commitTitle: z.string().optional().describe('Title for the automatic commit message'),
        commitMessage: z.string().optional().describe('Extra detail to append to automatic commit message'),
        mergeMethod: z.enum(['merge', 'squash', 'rebase']).optional().default('merge'),
    }),
    execute: async ({ githubToken, owner, repo, pullNumber, commitTitle, commitMessage, mergeMethod = 'merge' }) => {
        if (!githubToken) {
            return { error: 'GitHub token is required. Connect GitHub first.' };
        }
        const octokit = new Octokit({ auth: githubToken });
        try {
            const { data } = await octokit.rest.pulls.merge({
                owner,
                repo,
                pull_number: pullNumber,
                commit_title: commitTitle,
                commit_message: commitMessage,
                merge_method: mergeMethod,
            });
            return {
                sha: data.sha,
                merged: data.merged,
                message: data.message,
            };
        } catch (error: any) {
            return { error: `Failed to merge PR: ${error.message}` };
        }
    },
});
